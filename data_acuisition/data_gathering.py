import requests
import csv

# API URL and Token
url = "https://www.courtlistener.com/api/rest/v4/dockets/?date_filed__gte=2015-01-01&date_filed__lte=2023-01-01"
headers = {
    "Authorization": "Token 43e37b8280b830a4f2665686c8619f79533d26e9"
}

# Make the request to the API
response = requests.get(url, headers=headers)

# Check if the request was successful
if response.status_code == 200:
    data = response.json()  # Convert the response to JSON
    results = data.get('results', [])  # Extract the 'results' field from the response

    # Check if we have results to process
    if results:
        # Extract all the keys (fields) from the first result to use as CSV columns
        columns = results[0].keys()

        # Define the CSV file to save the data
        csv_file = "output.csv"

        # Write the data to a CSV file
        with open(csv_file, mode='w', newline='', encoding='utf-8') as file:
            writer = csv.DictWriter(file, fieldnames=columns)
            writer.writeheader()  # Write the header

            # Write each row of data
            for result in results:
                writer.writerow(result)

        print(f"Data saved successfully to {csv_file}")
    else:
        print("No results found in the API response.")
else:
    print(f"Failed to retrieve data. Status code: {response.status_code}")
