# Parallel Judgments: A Visual Exploration of Similar Case Outcomes

## Overview
Parallel Judgments is an interactive visualization tool designed to help legal professionals, researchers, and students analyze and compare court case decisions across different jurisdictions and time periods. The tool leverages D3.js to create multiple coordinated views that reveal patterns and relationships between cases based on their citations, temporal proximity, and other key characteristics.

## Live Demo
[View Live Demo (YouTube)](https://youtu.be/5fxkzTyYewM)

## Features

### 1. Interactive Case Table
- Comprehensive view of case metadata
- Selectable rows for detailed comparison
- Date range filtering capability

### 2. Radar Chart Visualization
Compares cases across three key dimensions:
- Citations: Number of times the case has been cited
- Cites To: Number of precedents referenced
- Decision Year: Temporal placement of the case

### 3. Parallel Coordinates Plot
Analyzes relationships between:
- Opinion Length: Indicating case complexity
- Citation Ratio: Measure of case influence vs. precedent reliance
- Jurisdiction Level: Court hierarchy position

### 4. Similarity Analysis Chart
- Weighted comparison of cases based on:
  - Citation overlap (70% weight)
  - Temporal proximity (30% weight)
- Interactive visualization of case relationships

## Data Source
- Data sourced from [CourtListener](https://www.courtlistener.com/) and [Caselaw Access Project](https://case.law/)
- Preprocessed and structured in JSON format
- Includes metadata such as citations, dates, jurisdictions, and opinion text

## Technical Implementation

### Built With
- D3.js for visualizations
- HTML/CSS for layout and styling
- JavaScript for interaction handling
- noUiSlider for date range selection

### File Structure
```
parallel-judgments/
├── index.html
├── style.css
├── app.js
├── data/
│   └── [JSON files]
├── screenshots/
└── README.md
```

### Key Functions
- `loadData()`: Initializes data loading and visualization setup
- `createTable()`: Generates interactive case comparison table
- `createRadarChart()`: Builds radar chart visualization
- `createParallelCoordinatesPlot()`: Creates parallel coordinates display
- `createSimilarityChart()`: Generates similarity analysis visualization
- `calculateEnhancedSimilarity()`: Computes case similarity metrics

## Setup and Installation

1. Clone the repository:
```bash
git clone https://github.com/dataviscourse2024/group-project-parallel-judgments-vis.git
```

2. Navigate to project directory:
```bash
cd group-project-parallel-judgments-vis
```

3. Start a local server:
```bash
python -m http.server 8000
```

4. Open in browser:
```
http://localhost:8000
```

## Usage Guide

1. **Case Selection**:
   - Use checkboxes in the table to select cases for comparison
   - Filter cases using the date range slider

2. **Visualization Interaction**:
   - Hover over elements for detailed tooltips
   - Use the parallel coordinates plot to identify patterns
   - Examine radar charts for case characteristic comparison

3. **Similarity Analysis**:
   - Select multiple cases to see their relationship strengths
   - Examine both citation overlap and temporal proximity

## Team Members
- Sampad Banik (u1467294@utah.edu)
- K M Arefeen Sultan (u1419693@utah.edu)

## Acknowledgments
- University of Utah Data Visualization Course
- CourtListener API
- Caselaw Access Project
- D3.js community