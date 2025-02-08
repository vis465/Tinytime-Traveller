const express = require('express');

require("dotenv").config();
const axios = require("axios");
const OLLAMA_MODEL="llama3.2:latest"
const OLLAMA_API_URL="http://115.244.160.81:11434/api/generate"
const SavedIdea=require("../models/SavedIdea")
const router = express.Router();

const formatBusinessIdeas = (businessIdeas) => {
    if (!businessIdeas || businessIdeas.length === 0) {
      return "No business ideas provided.";
    }
  
    return businessIdeas
      .map(
        (idea, index) => `
      Idea ${index + 1}:
      - Name: ${idea.name || "Not provided"}
      - Description: ${idea.description || "Not provided"}
      - Target Market: ${idea.targetMarket || "Not provided"}
      - Competitive Advantage: ${idea.competitiveAdvantage || "Not provided"}
      - Potential Challenges: ${idea.potentialChallenges || "Not provided"}
      - Estimated Initial Investment: $${idea.estimatedInitialInvestment || "Not provided"}
    `
      )
      .join("\n");
  };
  
  const generatePrompt = (userProfile, businessIdeasText) => {
    return `You are a business recommendation engine that generates tailored startup ideas based on user profiles. Analyze the following user data and provide ten business ideas along with structured insights in the specified JSON format.
  
    **User Profile:**
    - **Age:** ${userProfile.age || "Any age"}
    - **Education:** ${userProfile.education || "Any education"}
    - **Professional Background:** ${userProfile.professionalBackground || "Any background"}
    - **Skills:** ${userProfile.skills ? userProfile.skills.join(", ") : "Any skill"}
    - **Interests:** ${userProfile.interests ? userProfile.interests.join(", ") : "Any interest"}
    - **Available Capital:** $${userProfile.availableCapital || "Any capital"}
    - **Time Commitment:** ${userProfile.timeCommitment || "Any time commitment"}
    - **Risk Tolerance:** ${userProfile.riskTolerance || "Medium"}
    
    **Existing Ideas:** ${businessIdeasText}
    
    ### **Instructions:**
    -- Give only relevent ideas that can be done in the specified interest and experince
    - **STRICTLY GIVE output in JSON FORMAT** nothing else should be given
    - **Generate exactly **SEVEN** unique business ideas** based on the user profile.
    -- **DONOT give CODES OR dont give any EXPLANIATIONS, JUST IDEAS are enough**
    - **Ensure numerical values (scores, probabilities) are actual numbers**, not strings.
    - **Each idea should have exactly all the JSON values** 
    - **DONT RETURN ANYTHING APART FROM SPECIFIED FEILDS OF USER INTERESTS.** 
    -**Return all the feilds for each of the idea. each idea must be a single object**
    
    
    ---
    
    ### **Refactored JSON Structure:**
    json
    {
    "business_ideas": [
      {
        "idea_name": "string",
        "short_description": "string",
        "detailed_description": "string",
        "required_capital": "string",
        "time_to_market": "string",
        "recommendations": {
          "summary": "string",
          "ideas": [
            {
              "idea_name": "string",
              "improvements": ["string"],
              "differentiation_strategy": "string"
            }
          ]
        },
        "pivot_strategies": {
          "summary": "string",
          "strategies": [
            {
              "original_idea": "string",
              "pivot_option": "string",
              "reason": "string"
            }
          ]
        },
        "success_metrics": {
          "summary": "string",
          "ideas": [
            {
              "idea_name": "string",
              "success_probability": number,
              "key_success_factors": ["string"]
            }
          ]
        },
        "swot_analysis": {
          "summary": "string",
          "ideas": [
            {
              "idea_name": "string",
              "strengths": ["string"],
              "weaknesses": ["string"],
              "opportunities": ["string"],
              "threats": ["string"]
            }
          ]
        },
        "target_market": {
          "summary": "string",
          "audiences": [
            {
              "idea_name": "string",
              "primary_audience": "string",
              "demographics": ["string"],
              "psychographics": ["string"]
            }
          ]
        },
        "scalability": {
          "summary": "string",
          "opportunities": [
            {
              "idea_name": "string",
              "growth_opportunities": ["string"],
              "expansion_markets": ["string"],
              "diversification_options": ["string"]
            }
          ]
        },
        "business_model": {
          "summary": "string",
          "models": [
            {
              "idea_name": "string",
              "revenue_streams": ["string"],
              "key_partnerships": ["string"],
              "operational_requirements": "string",
              "estimated_margins": "string"
            }
          ]
        }
      }
    ]
  }
    `;
  };
  
  // Response parser
  const parseOllamaResponse = async (responseString) => {
    try {
      // Try to parse the entire response as JSON directly
      const parsedResponse = JSON.parse(responseString.trim());
      return { success: true, data: parsedResponse };
    } catch (parseError) {
      console.error("Failed to parse JSON response:", parseError);
      
      // Try to extract JSON if initial parse fails
      try {
        const jsonMatch = responseString.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const extractedJson = JSON.parse(jsonMatch[0]);
          return { success: true, data: extractedJson, extracted: true };
        }
      } catch (extractError) {
        console.error("Failed to extract JSON:", extractError);
      }
      
      return {
        success: false,
        error: parseError.message,
        rawResponse: responseString
      };
    }
  };
  
  // Main API handler
  const generateBusinessIdeas = async (userProfile, businessIdeas) => {
    const businessIdeasText = formatBusinessIdeas(businessIdeas);
    const prompt = generatePrompt(userProfile, businessIdeasText);
  
    const requestBody = {
      model: OLLAMA_MODEL,
      prompt: prompt,
      stream: false,
      format:"json"
    };
  
    try {
        console.log(OLLAMA_API_URL)
      const response = await axios.post(OLLAMA_API_URL, requestBody);
      console.log("API request successful");
      console.log(response)
      // return {
      //       success: true,
      //       data: {
      //         generatedIdeas: response.data.response
      //           }    }
      const parseResult = await parseOllamaResponse(response.data.response);
      
      if (parseResult.success) {
        return {
          success: true,
          data: {
            generatedIdeas: parseResult.data,
            note: parseResult.extracted ? "JSON was extracted from response" : undefined
          }
        };
      } else {
        return {
          success: false,
          error: "Failed to parse generated ideas",
          details: parseResult.error,
          rawResponse: parseResult.rawResponse
        };
      }
    } catch (error) {
      console.error("API request failed:", error);
      return {
        success: false,
        error: "Internal server error",
        details: error.message,
        stack: error.stack
      };
    }
  };
  
  // Express route handler
  router.post("/api/generateideas", async (req, res) => {
    try {
      console.log("Generate ideas request received");
      const { userProfile, businessIdeas } = req.body;
      console.log("User profile:", userProfile);
      console.log("Business ideas:", businessIdeas);
  
      const result = await generateBusinessIdeas(userProfile, businessIdeas);
      
      if (result.success) {
        res.status(200).json(result.data);
      } else {
        res.status(500).json({
          error: result.error,
          details: result.details,
          rawResponse: result.rawResponse
        });
      }
    } catch (error) {
      console.error("Route handler error:", error);
      res.status(500).json({
        error: "Internal server error",
        details: error.message
      });
    }
  });
router.post("/api/addidea", async (req, res) => {
  try {
    const { name, des, idea } = req.body;
    
    if (!name || !idea) {
      return res.status(400).json({ message: "Name and idea are required." });
    }

    const existingIdea = await SavedIdea.findOne({ name });
    if (existingIdea) {
      return res.status(400).json({ message: "Idea already saved!" });
    }

    const newIdea = new SavedIdea({ name, des, idea });
    await newIdea.save();

    res.status(201).json({ message: "Idea saved successfully!", idea: newIdea });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ✅ Get all saved ideas
router.get("/api/viewideas", async (req, res) => {
  try {
    const ideas = await SavedIdea.find();
    res.status(200).json(ideas);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ✅ Delete an idea by name
router.delete("/api/deleteidea/:name", async (req, res) => {
  try {
    const { name } = req.params;

    if (!name) {
      return res.status(400).json({ message: "Idea name is required." });
    }

    const deletedIdea = await SavedIdea.findOneAndDelete({ name });
    if (!deletedIdea) {
      return res.status(404).json({ message: "Idea not found." });
    }

    res.status(200).json({ message: "Idea deleted successfully.", deletedIdea });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});
module.exports = router;