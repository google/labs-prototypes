import time
from typing import Any, List, Tuple
from playwright.sync_api import sync_playwright
from google import genai
from google.genai import types
from google.genai.types import Content, Part

import os
from dotenv import load_dotenv
from website_navigation import execute_function_calls, get_function_responses
import mlflow

load_dotenv()
client = genai.Client(api_key=os.getenv('GEMINI_API_KEY'))
# Set up tracing
mlflow.gemini.autolog()
mlflow.set_tracking_uri("http://localhost:5000")

# Constants for screen dimensions
SCREEN_WIDTH = 1440
SCREEN_HEIGHT = 900

USER_PROMPT = """Explore http://bankofamerica.com/ and create a report for interesting website CUJs to look into for a new BoA customer who is interested in checkings account, credit cards, and investment accounts.
Try to answer the following questions:
1. What tasks might such users want to accomplish in this website?
2. What are the typical UI interaction trajectories for such customer?
3. Is there any repetitive pattern in the UI interaction trajectory? If so, you can just write down the pattern and skip the repetitive parts.
4. How many of these UI trajectories might a new user need to go through to complete their tasks?
"""

# USER_PROMPT = "Go to ai.google.dev/gemini-api/docs and search for pricing. Generate a report of the pricing."


# Setup Playwright
print("Initializing browser...")
playwright = sync_playwright().start()
browser = playwright.chromium.launch(headless=False)
context = browser.new_context(viewport={"width": SCREEN_WIDTH, "height": SCREEN_HEIGHT})
page = context.new_page()


def navigate_page(page):
  # Configure the model (From Step 1)
  config = types.GenerateContentConfig(
      tools=[types.Tool(computer_use=types.ComputerUse(
          environment=types.Environment.ENVIRONMENT_BROWSER
      ))],
      thinking_config=types.ThinkingConfig(include_thoughts=True),
  )

  # Initialize history
  initial_screenshot = page.screenshot(type="png")
  print(f"Goal: {USER_PROMPT}")

  contents = [
      Content(role="user", parts=[
          Part(text=USER_PROMPT),
          Part.from_bytes(data=initial_screenshot, mime_type='image/png')
      ])
  ]

  # Agent Loop
  turn_limit = 500
  auto_turns = 0
  for i in range(turn_limit):
      
      print(f"\n--- Turn {i+1} ---")
      if auto_turns == 0:
        user_input = input("Press Enter to continue, or enter a number of turns: ")
        if user_input.isdigit():
            auto_turns = int(user_input)
        else:
            auto_turns = 1
      auto_turns -= 1
      # import pdb; pdb.set_trace()

      response = client.models.generate_content(
          model='gemini-2.5-computer-use-preview-10-2025',
          contents=contents,
          config=config,
      )

      # import pdb; pdb.set_trace()

      candidate = response.candidates[0]
      contents.append(candidate.content)

      has_function_calls = any(part.function_call for part in candidate.content.parts)
      if not has_function_calls:
          text_response = " ".join([part.text for part in candidate.content.parts if part.text])
          print("Agent finished:", text_response)
          break

      print("Executing actions...")
      results = execute_function_calls(candidate, page, SCREEN_WIDTH, SCREEN_HEIGHT)

      print("Capturing state...")
      function_responses = get_function_responses(page, results)

      contents.append(
          Content(role="user", parts=[Part(function_response=fr) for fr in function_responses])
      )


page.goto("http://bankofamerica.com/")

def main():
    try:
      navigate_page(page)
    finally:
      # Cleanup
      print("\nClosing browser...")
      browser.close()
      playwright.stop()



main()
# input("Press Enter to continue...")
# scroll_to(page, {'direction': 'down', 'magnitude': 900}, SCREEN_HEIGHT)
# input("Press Enter to continue...")
# scroll_to(page, {'direction': 'down'}, SCREEN_HEIGHT)
# input("Press Enter to continue...")
# scroll_to(page, {'direction': 'up'}, SCREEN_HEIGHT)