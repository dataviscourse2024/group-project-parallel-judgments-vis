import requests
import pandas as pd
import os

# List of URLs
urls = [
    "https://huggingface.co/api/datasets/harvard-lil/cold-cases/parquet/default/train/4.parquet",
    "https://huggingface.co/api/datasets/harvard-lil/cold-cases/parquet/default/train/5.parquet",
    "https://huggingface.co/api/datasets/harvard-lil/cold-cases/parquet/default/train/6.parquet"
]

# Directory to save files
output_dir = "parquet_json_files"
os.makedirs(output_dir, exist_ok=True)

# Loop to download, convert, and save
for i, url in enumerate(urls):
    try:
        print(f"Downloading file {i + 1} of {len(urls)}...")
        # Download the file
        response = requests.get(url)
        response.raise_for_status()
        
        # Save the parquet file
        parquet_file_path = os.path.join(output_dir, f"file_{i}.parquet")
        with open(parquet_file_path, "wb") as file:
            file.write(response.content)
        
        print(f"File {i + 1} downloaded and saved as {parquet_file_path}. Converting to JSON...")

        # Convert parquet to JSON
        df = pd.read_parquet(parquet_file_path)
        json_file_path = os.path.join(output_dir, f"file_{i}.json")
        df.to_json(json_file_path, orient="records", lines=True)
        
        print(f"File {i + 1} converted to JSON and saved as {json_file_path}.")
    except Exception as e:
        print(f"An error occurred with file {i + 1}: {e}")

print("All files processed!")
