import os
import json

def create_data_manifest():
    # Define the crime categories based on the directories
    crime_categories = ['kidnapping', 'Murder', 'Rape', 'Robbery']
    manifest = []
    
    # Base directory where crime category folders are located
    project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    base_dir = os.path.join(project_root, 'data')
    
    # Iterate through each crime category
    for category in crime_categories:
        category_path = os.path.join(base_dir, category)
        
        # Check if directory exists
        if os.path.exists(category_path):
            # Get all JSON files in the directory
            json_files = [f for f in os.listdir(category_path) if f.endswith('.json')]
            
            # Add each file's info to manifest
            for json_file in json_files:
                file_path = os.path.relpath(os.path.join(category_path, json_file), project_root)
                manifest.append({
                    'path': file_path.replace('\\', '/'),  # Ensure forward slashes for web
                    'filename': json_file
                })
    
    # Write manifest to a JSON file
    manifest_path = os.path.join(base_dir, 'manifest.json')
    with open(manifest_path, 'w') as f:
        json.dump(manifest, f, indent=2)
    
    print(f"Created manifest with {len(manifest)} files at {manifest_path}")

if __name__ == "__main__":
    create_data_manifest()