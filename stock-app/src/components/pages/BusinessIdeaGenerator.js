import React, { useState, useEffect } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../ui/card";
import { Textarea } from "../ui/textarea";
import { Alert, AlertDescription } from "../ui/alert";
import {
  Brain,
  Target,
  Star,
  AlertTriangle,
  DollarSign,
  Download,
  Plus,
  Trash2,
  Save,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import axios from "axios";
import IdeaDetailsDialog from "./IdeaDetailsDialog";
const API_BASE_URL = "http://localhost:5000/api";

const BusinessIdeaGenerator = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false); // State for dialog
  const [userProfile, setUserProfile] = useState({
    age: "",
    education: "",
    professionalBackground: "",
    skills: [""],
    interests: [""],
    availableCapital: "",
    timeCommitment: "",
    riskTolerance: "Medium",
  });

  const [newUserIdea, setNewUserIdea] = useState({
    name: "",
    description: "",
    targetMarket: "",
    competitiveAdvantage: "",
    potentialChallenges: "",
    estimatedInitialInvestment: "",
  });

  const [businessIdeas, setBusinessIdeas] = useState([]);
  const [userBusinessIdeas, setUserBusinessIdeas] = useState([]);
  const [savedIdeas, setSavedIdeas] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleProfileChange = (field, value) => {
    setUserProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleArrayFieldChange = (field, index, value) => {
    setUserProfile((prev) => {
      const newArray = [...prev[field]];
      newArray[index] = value;
      return {
        ...prev,
        [field]: newArray,
      };
    });
  };

  const addArrayField = (field) => {
    setUserProfile((prev) => ({
      ...prev,
      [field]: [...prev[field], ""],
    }));
  };

  const removeArrayField = (field, index) => {
    setUserProfile((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const handleUserIdeaChange = (field, value) => {
    setNewUserIdea((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const addUserIdea = () => {
    if (newUserIdea.name && newUserIdea.description) {
      setUserBusinessIdeas((prev) => [
        ...prev,
        { ...newUserIdea, id: Date.now() },
      ]);
      setNewUserIdea({
        name: "",
        description: "",
        targetMarket: "",
        competitiveAdvantage: "",
        potentialChallenges: "",
        estimatedInitialInvestment: "",
      });
    }
  };

  const generateIdeas = async () => {
    setIsLoading(true);

    try {
      const formattedUserProfile = `User Profile:
      - Age: ${userProfile.age}
      - Education: ${userProfile.education}
      - Professional Background: ${userProfile.professionalBackground}
      - Skills: ${userProfile.skills.join(", ")}
      - Interests: ${userProfile.interests.join(", ")}
      - Available Capital: $${userProfile.availableCapital}
      - Time Commitment: ${userProfile.timeCommitment}
      - Risk Tolerance: ${userProfile.riskTolerance}`;

      const formattedUserIdeas = userBusinessIdeas
        .map(
          (idea, index) => `
      Idea ${index + 1}:
      - Name: ${idea.name}
      - Description: ${idea.description}
      - Target Market: ${idea.targetMarket}
      - Competitive Advantage: ${idea.competitiveAdvantage}
      - Potential Challenges: ${idea.potentialChallenges}
      - Estimated Initial Investment: $${idea.estimatedInitialInvestment}
      `
        )
        .join("\n");
      console.log(formattedUserIdeas, formattedUserProfile);
      console.log(`posting http://${API_BASE_URL}/generateideas`);
      const response = await axios.post(
        `${API_BASE_URL}/generateideas`,
        {
          userProfile: formattedUserProfile,
          userBusinessIdeas: formattedUserIdeas,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Posted");
      console.log("Full API response:", response.data);
      console.log(
        "Generated ideas from response:",
        response.data.generatedIdeas
      );
      console.log(
        "Business ideas array:",
        response.data.generatedIdeas.business_ideas
      );

      // Let's check the structure of the data before setting state
      const data = response.data.generatedIdeas.business_ideas;
      console.log("Data to be set in state:", data);

      if (Array.isArray(data)) {
        console.log("Data is an array with length:", data.length);
        setBusinessIdeas(data);
      } else {
        console.log("Data is not an array, it is:", typeof data);
        // If data is not in the expected format, let's try to fix it
        const formattedData = Array.isArray(response.data.generatedIdeas)
          ? response.data.generatedIdeas
          : [response.data.generatedIdeas];
        console.log("Formatted data:", formattedData);
        setBusinessIdeas(formattedData);
      }
    } catch (error) {
      console.error("Error generating ideas:", error);
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const saveIdea = async (idea) => {
    setSavedIdeas((prev) => [...prev, idea]);
let name=idea.idea_name
let des=idea.short_description
  let body={name,des,idea}
    try {
      console.log(body)
      
      const response = await axios.post(`${API_BASE_URL}/addidea`, body);
      console.log("saving ideas")
      if (response.status === 201) {
        setSavedIdeas((prev) => [...prev, response.data.idea]);
      }
    } catch (error) {
      console.error("Error saving idea:", error.response?.data?.message || error.message);
    }
  };

  // ✅ Remove idea from backend
  const removesaveIdea = async (idea) => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/deleteidea/${idea.idea_name}`
      );
      if (response.status === 200) {
        setSavedIdeas((prev) =>
          prev.filter((saved) => saved.idea_name !== idea.idea_name)
        );
      }
    } catch (error) {
      console.error(
        "Error deleting idea:",
        error.response?.data?.message || error.message
      );
    }
  };
  const getsavedideas = async() =>{
    try {
      console.log("method called")
      const response = await axios.get(`${API_BASE_URL}/viewideas`);
      if (response.status === 200) {
        console.log(response.data)
        setSavedIdeas(response.data);
      }
    }
    catch(err){
      console.log(err)
    }
  }
  const exportIdeas = () => {
    const dataStr = JSON.stringify(savedIdeas, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataUri);
    downloadAnchorNode.setAttribute("download", "business-ideas.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const renderContent = (data) => {
    if (!data || typeof data !== "object") {
      return null;
    }

    return (
      <div className="w-full space-y-4">
        {Object.entries(data).map(([key, value], index) => (
          <Card key={index} className="overflow-hidden border border-gray-200">
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold capitalize mb-2 text-primary">
                {key.replace(/_/g, " ")}
              </h3>

              <div className="pl-4">
                {Array.isArray(value) ? (
                  <div className="space-y-2">
                    {value.map((item, idx) => (
                      <div key={idx} className="ml-2">
                        {typeof item === "object" ? (
                          renderContent(item)
                        ) : (
                          <div className="py-1 px-3 bg-gray-50 rounded-md text-gray-700">
                            {item}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : typeof value === "object" ? (
                  <div className="border-l-2 border-gray-200 pl-4">
                    {renderContent(value)}
                  </div>
                ) : (
                  <div className="py-2 px-3 bg-gray-50 rounded-md text-gray-700">
                    {value}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary mb-2">
            Business Idea Generator
          </h1>
          <p className="text-gray-600">
            Generate personalized business ideas based on your profile
          </p>
        </div>

        {/* Navigation */}
        <div className="flex space-x-4 border-b">
          <button
            className={`px-4 py-2 ${
              activeTab === "profile"
                ? "border-b-2 border-primary font-semibold"
                : ""
            }`}
            onClick={() => setActiveTab("profile")}
          >
            Profile
          </button>
          <button
            className={`px-4 py-2 ${
              activeTab === "userIdeas"
                ? "border-b-2 border-primary font-semibold"
                : ""
            }`}
            onClick={() => setActiveTab("userIdeas")}
          >
            Your Ideas
          </button>
          <button
            className={`px-4 py-2 ${
              activeTab === "ideas"
                ? "border-b-2 border-primary font-semibold"
                : ""
            }`}
            onClick={() => setActiveTab("ideas")}
          >
            Generated Ideas
          </button>
          <button
            className={`px-4 py-2 ${
              activeTab === "saved"
                ? "border-b-2 border-primary font-semibold"
                : ""
            }`}
            onClick={() => { setActiveTab("saved"); getsavedideas(); }}
          >
            Saved Ideas
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <Card>
            <CardHeader>
              <CardTitle>Your Profile</CardTitle>
              <CardDescription>
                Fill in your details to get personalized recommendations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Age"
                  value={userProfile.age}
                  onChange={(e) => handleProfileChange("age", e.target.value)}
                />
                <Input
                  placeholder="Education"
                  value={userProfile.education}
                  onChange={(e) =>
                    handleProfileChange("education", e.target.value)
                  }
                />
                <Input
                  placeholder="Available Capital (Rs.)"
                  type="number"
                  value={userProfile.availableCapital}
                  onChange={(e) =>
                    handleProfileChange("availableCapital", e.target.value)
                  }
                />
                <Input
                  placeholder="Time Commitment (hours/week)"
                  type="number"
                  value={userProfile.timeCommitment}
                  onChange={(e) =>
                    handleProfileChange("timeCommitment", e.target.value)
                  }
                />
              </div>

              <Textarea
                placeholder="Professional Background"
                value={userProfile.professionalBackground}
                onChange={(e) =>
                  handleProfileChange("professionalBackground", e.target.value)
                }
              />

              {/* Skills Section */}
              <div className="space-y-2">
                <label className="font-medium">Skills</label>
                {userProfile.skills.map((skill, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="Enter a skill"
                      value={skill}
                      onChange={(e) =>
                        handleArrayFieldChange("skills", index, e.target.value)
                      }
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => removeArrayField("skills", index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={() => addArrayField("skills")}
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Skill
                </Button>
              </div>

              {/* Interests Section */}
              <div className="space-y-2">
                <label className="font-medium">Interests</label>
                {userProfile.interests.map((interest, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="Enter an interest"
                      value={interest}
                      onChange={(e) =>
                        handleArrayFieldChange(
                          "interests",
                          index,
                          e.target.value
                        )
                      }
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => removeArrayField("interests", index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={() => addArrayField("interests")}
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Interest
                </Button>
              </div>

              {/* Risk Tolerance */}
              <div className="space-y-2">
                <label className="font-medium">Risk Tolerance</label>
                <div className="flex gap-2">
                  {["Low", "Medium", "High"].map((level) => (
                    <Button
                      key={level}
                      variant={
                        userProfile.riskTolerance === level
                          ? "default"
                          : "outline"
                      }
                      onClick={() =>
                        handleProfileChange("riskTolerance", level)
                      }
                    >
                      {level}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* User Ideas Tab */}
        {activeTab === "userIdeas" && (
          <Card>
            <CardHeader>
              <CardTitle>Your Business Ideas</CardTitle>
              <CardDescription>
                Add your own business ideas to get personalized analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  placeholder="Idea Name"
                  value={newUserIdea.name}
                  onChange={(e) => handleUserIdeaChange("name", e.target.value)}
                />
                <Textarea
                  placeholder="Describe your business idea"
                  value={newUserIdea.description}
                  onChange={(e) =>
                    handleUserIdeaChange("description", e.target.value)
                  }
                />
                <Input
                  placeholder="Target Market"
                  value={newUserIdea.targetMarket}
                  onChange={(e) =>
                    handleUserIdeaChange("targetMarket", e.target.value)
                  }
                />
                <Textarea
                  placeholder="Competitive Advantage"
                  value={newUserIdea.competitiveAdvantage}
                  onChange={(e) =>
                    handleUserIdeaChange("competitiveAdvantage", e.target.value)
                  }
                />
                <Textarea
                  placeholder="Potential Challenges"
                  value={newUserIdea.potentialChallenges}
                  onChange={(e) =>
                    handleUserIdeaChange("potentialChallenges", e.target.value)
                  }
                />
                <Input
                  placeholder="Estimated Initial Investment ($)"
                  type="number"
                  value={newUserIdea.estimatedInitialInvestment}
                  onChange={(e) =>
                    handleUserIdeaChange(
                      "estimatedInitialInvestment",
                      e.target.value
                    )
                  }
                />
                <Button onClick={addUserIdea} className="w-full">
                  <Plus className="h-4 w-4 mr-2" /> Add Idea
                </Button>

                {userBusinessIdeas.length > 0 && (
                  <div className="mt-6 space-y-4">
                    <h3 className="font-semibold">Your Added Ideas</h3>
                    {userBusinessIdeas.map((idea, index) => (
                      <Card
                        key={idea.id}
                        className="hover:shadow-lg transition-shadow"
                      >
                        <CardContent className="pt-6">
                          <h4 className="font-medium mb-2">
                            Idea {index + 1}: {idea.name}
                          </h4>
                          <div className="space-y-2 text-sm text-gray-600">
                            <p>
                              <strong>Description:</strong> {idea.description}
                            </p>
                            <p>
                              <strong>Target Market:</strong>{" "}
                              {idea.targetMarket}
                            </p>
                            <p>
                              <strong>Competitive Advantage:</strong>{" "}
                              {idea.competitiveAdvantage}
                            </p>
                            <p>
                              <strong>Potential Challenges:</strong>{" "}
                              {idea.potentialChallenges}
                            </p>
                            <p>
                              <strong>Estimated Investment:</strong> $
                              {idea.estimatedInitialInvestment}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Generated Ideas Tab */}
        {activeTab === "ideas" && (
          <Card>
            <CardHeader>
              <CardTitle>Generated Business Ideas</CardTitle>
              <CardDescription>
                Explore the ideas generated based on your profile and ideas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {businessIdeas.length === 0 ? (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      No ideas generated yet. Please generate new ideas.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {businessIdeas.map((idea, index) => (
                      <Card
                        key={index}
                        className="hover:shadow-lg transition-shadow"
                      >
                        <CardContent className="pt-6">
                          <h3 className="font-semibold text-lg mb-2">
                            {idea.idea_name}
                          </h3>
                          <p className="text-gray-600 mb-4">
                            {idea.short_description}
                          </p>
                          <div className="flex gap-2">
                            {/* View Details Button - Opens Dialog */}
                            <Button
                              variant="outline"
                              onClick={() => {
                                setSelectedIdea(idea);
                                setDialogOpen(true);
                              }}
                            >
                              View Details
                            </Button>

                            {/* Save Idea Button */}
                            <Button
                              onClick={() => saveIdea(idea)}
                              variant="outline"
                            >
                              <Star className="h-4 w-4 mr-2" /> Save
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    {/* IdeaDetailsDialog should be outside the loop */}
                    <IdeaDetailsDialog
                      isOpen={dialogOpen}
                      onClose={() => setDialogOpen(false)}
                      idea={selectedIdea}
                    />
                  </div>
                )}
              </div>
            </CardContent>
            <Button onClick={generateIdeas} className="w-full">
              {isLoading ? "Generating..." : "Generate Ideas"}
            </Button>
          </Card>
        )}

        {/* Saved Ideas Tab */}
        {activeTab === "saved" && (
          <Card>
            <CardHeader>
              <CardTitle>Saved Business Ideas</CardTitle>
              <CardDescription>Here are your saved ideas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {savedIdeas.length === 0 ? (
                  <Alert>
                    <DollarSign className="h-4 w-4" />
                    <AlertDescription>No saved ideas yet.</AlertDescription>
                  </Alert>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {savedIdeas.map((idea, index) => (
                      <Card
                        key={index}
                        className="hover:shadow-lg transition-shadow"
                      >
                        <CardContent className="pt-6">
                          <h3 className="font-semibold text-lg mb-2">
                            {idea.name}
                          </h3>
                          <p className="text-gray-600 mb-4">
                            {idea.description}
                          </p>
                          <div className="flex gap-2">
                            {/* View Details Button - Opens Dialog */}
                            <Button
                              variant="outline"
                              onClick={() => {
                                setSelectedIdea(idea);
                                setDialogOpen(true);
                              }}
                            >
                              View Details
                            </Button>

                            {/* Save Idea Button */}
                            <Button
                              onClick={() => removesaveIdea(idea)}
                              variant="outline"
                              style={{backgroundColor:"red",color:"white"}}
                            >
                              <Star className="h-4 w-4 mr-2" color="white" /> Un - Save
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    {/* IdeaDetailsDialog should be outside the loop */}
                    <IdeaDetailsDialog
                      isOpen={dialogOpen}
                      onClose={() => setDialogOpen(false)}
                      idea={selectedIdea}
                    />
                  </div>
                )}
              </div>
              <Button onClick={exportIdeas} className="w-50 mt-10">
                <Download className="h-4 w-4 mr-2" /> Export Ideas
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
export default BusinessIdeaGenerator;
