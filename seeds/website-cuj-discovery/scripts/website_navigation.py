from typing import Any, List, Tuple
import time
from google.genai import types
from google.genai.types import Content, Part

def denormalize_x(x: int, screen_width: int) -> int:
    """Convert normalized x coordinate (0-1000) to actual pixel coordinate."""
    return int(x / 1000 * screen_width)

def denormalize_y(y: int, screen_height: int) -> int:
    """Convert normalized y coordinate (0-1000) to actual pixel coordinate."""
    return int(y / 1000 * screen_height)

def highlight_and_click_at(page, x, y, screen_width, screen_height):
    actual_x = denormalize_x(x, screen_width)
    actual_y = denormalize_y(y, screen_height)
    element_handle = page.evaluate_handle("([x, y]) => document.elementFromPoint(x, y)", [actual_x, actual_y])
    element_handle.evaluate("(el) => { el.style.border = '2px solid red'; }")
    
    page.mouse.click(actual_x, actual_y)

def scroll_to(page, args, screen_height):
    print(f"  -> Scrolled to: {args}")
    magnitude = args.get("magnitude", 800)  # 800 out of 1000
    magnitude = denormalize_y(magnitude, screen_height)
    if args["direction"] == "down":
        page.evaluate("(y) => {window.scrollBy(0, y) }", magnitude)
    elif args["direction"] == "up":
        page.evaluate("(y) => {window.scrollBy(0, -y) }", magnitude)

def execute_function_calls(candidate, page, screen_width, screen_height):
    results = []
    function_calls = []
    for part in candidate.content.parts:
        if part.function_call:
            function_calls.append(part.function_call)

    for function_call in function_calls:
        action_result = {}
        fname = function_call.name
        args = function_call.args
        print(f"  -> Executing: {fname}")

        try:
            if fname == "open_web_browser":
                pass # Already open
            elif fname == "click_at":
              highlight_and_click_at(page, args["x"], args["y"], screen_width, screen_height)
            elif fname == "type_text_at":
                actual_x = denormalize_x(args["x"], screen_width)
                actual_y = denormalize_y(args["y"], screen_height)
                text = args["text"]
                press_enter = args.get("press_enter", False)

                page.mouse.hover(actual_x, actual_y)
                time.sleep(0.5)
                page.mouse.click(actual_x, actual_y)
                # Simple clear (Command+A, Backspace for Mac)
                page.keyboard.press("Meta+A")
                page.keyboard.press("Backspace")
                page.keyboard.type(text)
                if press_enter:
                    page.keyboard.press("Enter")
                print(f"  -> Typed: {text}")
            elif fname == "scroll_document":
                scroll_to(page, args, screen_height)
            else:
                print(f"Warning: Unimplemented or custom function {fname}")

            # Wait for potential navigations/renders
            page.wait_for_load_state(timeout=5000)
            time.sleep(1)

        except Exception as e:
            print(f"Error executing {fname}: {e}")
            action_result = {"error": str(e)}

        results.append((fname, action_result))

    return results
  
def get_function_responses(page, results):
    screenshot_bytes = page.screenshot(type="png")
    current_url = page.url
    function_responses = []
    for name, result in results:
        response_data = {"url": current_url}
        response_data.update(result)
        function_responses.append(
            types.FunctionResponse(
                name=name,
                response=response_data, # By default passes in new url
                parts=[types.FunctionResponsePart(
                        # By default passes in new page screenshot
                        inline_data=types.FunctionResponseBlob(
                            mime_type="image/png",
                            data=screenshot_bytes))
                ]
            )
        )
    return function_responses