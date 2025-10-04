Terra-Nova: Urban Food System Resilience

NASA Space Apps Challenge: Data Pathways to Healthy Cities and Human Settlements
[Link to Challenge Page: https://www.spaceappschallenge.org/2025/challenges/data-pathways-to-healthy-cities-and-human-settlements/]
[Link to your project page if available]
[Link to your demo video if available]

-----

1. THE PROBLEM & OUR SOLUTION (IMPACT & CREATIVITY)

The current linear food system (Farm to Fork to Landfill) is a broken pathway preventing cities from achieving true wellbeing. Terra-Nova addresses the dual crisis of Food Insecurity (~1.7 billion urban residents at risk) and Environmental Pollution (~1.3 billion tonnes of food waste annually, contributing 10% of global greenhouse gas emissions).

Our solution is a Circular Urban Food System Platform that leverages NASA Earth Observation Data to transform food waste from a pollutant into a valuable resource. We empower the Urban Planner with the smart strategies required to build healthier, more resilient cities.

CORE STRATEGY: THE TWO DATA PATHWAYS

    - Social Wellbeing (Food Equity): We use NASA data to strategically prioritize aid and ensure equitable food distribution to the highest-need urban populations.
    - Environmental Wellbeing (Resource Recovery): We use Earth Observation data to identify optimal urban land for composting and urban agriculture, mitigating pollution and supporting sustainable city growth.

-----

2. FEATURES & NASA DATA INTEGRATION (RELEVANCE & VALIDITY)

The Terra-Nova platform is designed with two distinct portals to serve both strategic (Urban Planner) and operational (Donor/Collector) needs.

2.1. THE URBAN PLANNER DASHBOARD (STRATEGY)

This dashboard is the central tool for urban planners to develop and implement data-driven strategies for healthy city growth.

    - Feature: GVI Priority Map
        - Strategic Function: Displays the Geo-spatial Vulnerability Index (GVI) as a heat map over the city. This allows the planner to identify and prioritize high-need districts for targeted food distribution policies.
        - Key NASA Data Used: NASA SEDAC (Socioeconomic Data and Applications Center) and EU GHSL (Global Human Settlement Layer) provide population density, socioeconomic indicators, and infrastructure access data to compute the GVI.

    - Feature: Compost Site Locator
        - Strategic Function: A tool for city planning to identify optimal, underutilized urban lots suitable for establishing new composting centers or community gardens, contributing to smart, green growth.
        - Key NASA Data Used: HLS (Harmonized Landsat Sentinel) and CSA RCM (Canadian Space Agency RadarSat Constellation Mission) provide high-resolution land-use imagery for site suitability analysis.

    - Feature: Environmental Validation
        - Strategic Function: Tracks the measurable environmental impact of the compost program on newly greened urban spaces.
        - Key NASA Data Used: INPE (National Institute for Space Research) and HLS (Harmonized Landsat Sentinel) provide data for monitoring the Normalized Difference Vegetation Index (NDVI) to prove soil health improvement and vegetation growth.

2.2. THE OPERATIONAL PORTAL (EXECUTION)

This portal streamlines daily operations, ensuring food safety and efficient resource routing from donors.

    - Feature: AI Quality Control Gateway
        - Functionality: Instantaneously classifies surplus food as "Donate" (safe for distribution) or "Compost" (for recycling) via image input from the collector team's mobile app. This is critical for guaranteeing public health safety.
        - Technology: Multimodal LLM (Gemini 2.5 Flash API) is used for zero-shot image classification and provides a crucial audit trail with human-readable reasoning for its classification decisions.

    - Feature: Donor Intake Form
        - Functionality: A simple web portal for donors (restaurants, food factories) to submit requests for surplus food pickup. The pickup time is automatically prioritized based on the Urban Planner's GVI-driven distribution policies.
        - Technology: React Frontend handles the user interface. A Node.js Backend processes the requests, integrates with the AI, and manages routing logic.

-----

3. TECH STACK & ARCHITECTURE

Component: Frontend
Technology: React
Rationale: Chosen for its component-driven UI/UX, enabling a responsive and intuitive user interface across different devices.

Component: Backend/API
Technology: Node.js
Rationale: Provides a fast, scalable API gateway to efficiently manage data flow between the React frontend, external NASA APIs, and the AI model.

Component: AI/ML
Technology: Gemini 2.5 Flash API
Rationale: Leverages cutting-edge multimodal LLM capabilities for rapid, zero-shot image classification, eliminating the need for extensive model training and demonstrating high technical validity.

Component: Mapping
Technology: React-Leaflet / Mapbox
Rationale: Integrated for dynamic and interactive display of geospatial layers, including GVI heat maps and potential compost site locations.

Component: Data Processing
Technology: Python/GDAL (or Node.js libraries)
Rationale: Utilized for preprocessing and transforming raw NASA raster data into usable GeoJSON layers for map visualization.


-----

4. FUTURE SCOPE & IMPACT

Terra-Nova's reliance on globally available open data (NASA SEDAC, HLS, GHSL) ensures that this solution is inherently scalable and not limited to a single region.

    - Policy Automation: Future integration with municipal systems could allow for automated adjustment of logistics parameters (e.g., GVI priority factors) based on real-time data or emergency responses.
    - Predictive Modeling: Leverage historical donation/waste data combined with NASA climate models to forecast future food insecurity spikes or resource needs due to environmental events.
    - Global Expansion: The modular design and open-source data foundation mean the platform can be deployed in any fast-growing city worldwide, providing a scalable framework for global food resilience and pollution mitigation.


We are committed to building a healthier, more resilient planet. Thank you for judging our project.
