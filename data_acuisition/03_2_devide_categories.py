import json
import os
from nltk.tokenize import word_tokenize

# Directories
input_folder = 'separated_cases'  # Folder containing the JSON files
output_base_folder = 'crime_categories'  # Base folder for categorized records
os.makedirs(output_base_folder, exist_ok=True)

# Crime categories and their core keywords
crime_categories = {
    "Kidnapping": {"kidnap", "kidnapping", "kidnapper", "abduction", "abduct"},
    "Robbery": {"robbery", "robber", "heist", "burglary", "theft", "stealing"},
    "Rape": {"rape", "sexual assault", "molestation", "sexual harassment"},
    "Murder": {"murder", "homicide", "manslaughter", "killing", "assassination"},
}

# Helper function to tokenize and search for keywords in a text
def contains_keywords_nlp(text, keywords):
    if isinstance(text, str):  # Only process strings
        tokens = word_tokenize(text.lower())  # Tokenize and convert to lowercase
        return any(keyword in tokens for keyword in keywords)
    return False

# Recursive function to search for keywords in all fields of a record
def search_in_record(record, keywords):
    if isinstance(record, dict):
        return any(search_in_record(value, keywords) for value in record.values())
    elif isinstance(record, list):
        return any(search_in_record(item, keywords) for item in record)
    else:
        return contains_keywords_nlp(record, keywords)

# Process each file in the input folder
for filename in os.listdir(input_folder):
    if filename.endswith('.json'):  # Only process JSON files
        input_file_path = os.path.join(input_folder, filename)
        
        # Read the JSON file
        with open(input_file_path, 'r') as file:
            try:
                record = json.load(file)
            except json.JSONDecodeError:
                print(f"Skipping invalid JSON file: {filename}")
                continue
        
        # Check each category for matches
        for category, keywords in crime_categories.items():
            if search_in_record(record, keywords):
                # Add the crime category field
                record["crime_category"] = category

                # Save the updated record to the category folder
                category_folder = os.path.join(output_base_folder, category)
                os.makedirs(category_folder, exist_ok=True)
                output_file_path = os.path.join(category_folder, filename)
                with open(output_file_path, 'w') as output_file:
                    json.dump(record, output_file, indent=4)
                
                print(f"Copied to {category}: {filename}")
                break  # Avoid categorizing the same file into multiple categories

print(f"All matching files copied to category folders in '{output_base_folder}'.")
