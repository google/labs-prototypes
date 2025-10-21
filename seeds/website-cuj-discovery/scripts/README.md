## Website CUJ Discovery

Trying to automatically define and discover UI interaction CUJs (User Journey Flows) on a website.

Use cases:

1. help first time users navigate complex websites e.g. Concur, SAP, BoA.
2. use as inputs to QA / E2E tests for websites.
3. give content recommendations to users e.g. labs.google

The scripts in this directory are used as concept validation to see if the models are advanced enough for such tasks.

## How to run?

(Optional: start a virtual environment)
```shell
python3 -m venv venv
source venv/bin/activate
```

```shell
pip3 install -r requirements.txt
python3 website_discovery.py
```

Follow the terminal instructions to complete the run.

## What's next?
1. figuring out how to get the models to generate the UI interaction trajectories. Probably with prompt engineering + figuring out the right type of website to use.
2. implement more function calls in `website_navigation.execute_function_calls`.

