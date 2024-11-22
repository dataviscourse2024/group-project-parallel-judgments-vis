import re
import json
import os

# Input and output settings
input_file = 'json_file.json'
output_folder = 'separated_cases'
os.makedirs(output_folder, exist_ok=True)

# Read raw content
with open(input_file, 'r') as file:
    content = file.read()

# Use regex to extract all JSON-like objects
matches = re.findall(r'\{(?:[^{}]|(?:\{.*?\}))*\}', content, re.DOTALL)

# Helper function to repair malformed JSON
def repair_json(text):
    try:
        # Validate the JSON
        return json.loads(text)
    except json.JSONDecodeError:
        # Attempt basic fixes
        text = text.replace("'", "\"")  # Replace single quotes with double quotes
        text = re.sub(r'(\w+):', r'"\1":', text)  # Add quotes around property names
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            return None  # Return None if still invalid

# Save each valid JSON object to a file
for i, match in enumerate(matches, start=1):
    repaired = repair_json(match)
    if repaired:
        output_file = os.path.join(output_folder, f'{i}.json')
        with open(output_file, 'w') as out_file:
            json.dump(repaired, out_file, indent=4)
        print(f"Saved: {output_file}")
    else:
        print(f"Skipping invalid JSON object at index {i}")

print(f"Processed {len(matches)} JSON objects.")
