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
} from "@/components/ui/dialog";

const BusinessIdeaGenerator = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [selectedIdea, setSelectedIdea] = useState(null);
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
    setNewUserIdea(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addUserIdea = () => {
    if (newUserIdea.name && newUserIdea.description) {
      setUserBusinessIdeas(prev => [...prev, { ...newUserIdea, id: Date.now() }]);
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
      - Skills: ${userProfile.skills.join(', ')}
      - Interests: ${userProfile.interests.join(', ')}
      - Available Capital: $${userProfile.availableCapital}
      - Time Commitment: ${userProfile.timeCommitment}
      - Risk Tolerance: ${userProfile.riskTolerance}`;

      const formattedUserIdeas = userBusinessIdeas.map((idea, index) => `
      Idea ${index + 1}:
      - Name: ${idea.name}
      - Description: ${idea.description}
      - Target Market: ${idea.targetMarket}
      - Competitive Advantage: ${idea.competitiveAdvantage}
      - Potential Challenges: ${idea.potentialChallenges}
      - Estimated Initial Investment: $${idea.estimatedInitialInvestment}
      `).join('\n');

      const response = await fetch("/api/generateideas", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userProfile: formattedUserProfile,
          userBusinessIdeas: formattedUserIdeas
        })
      });
      const data = await response.json();
      setBusinessIdeas(data.ideas);
    } catch (error) {
      console.error("Error generating ideas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveIdea = (idea) => {
    if (!savedIdeas.some(saved => saved.name === idea.name)) {
      setSavedIdeas(prev => [...prev, { ...idea, savedAt: new Date() }]);
    }
  };

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

  const IdeaDetailModal = ({ idea }) => (
    <div className="space-y-6">
      {/* Overview Section */}
      <section className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-xl font-semibold mb-2">Business Overview</h3>
        <p className="text-gray-700">{idea.description}</p>
      </section>

      {/* Viability Analysis */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Viability Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Success Probability:</span>
                <span className="font-semibold">{idea.successProbability}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ width: `${idea.successProbability}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Target Customer Base</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-4 space-y-1">
              {idea.targetCustomers?.map((customer, index) => (
                <li key={index}>{customer}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>

      {/* SWOT Analysis */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Strengths</h4>
          <ul className="list-disc pl-4">
            {idea.swot?.strengths.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Weaknesses</h4>
          <ul className="list-disc pl-4">
            {idea.swot?.weaknesses.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Opportunities</h4>
          <ul className="list-disc pl-4">
            {idea.swot?.opportunities.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Threats</h4>
          <ul className="list-disc pl-4">
            {idea.swot?.threats.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* Business Model */}
      <section className="bg-white p-4 rounded-lg border">
        <h3 className="text-xl font-semibold mb-4">Business Model</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold">Revenue Streams</h4>
            <p>{idea.businessModel?.revenueStreams}</p>
          </div>
          <div>
            <h4 className="font-semibold">Cost Structure</h4>
            <p>{idea.businessModel?.costStructure}</p>
          </div>
          <div>
            <h4 className="font-semibold">Key Resources</h4>
            <p>{idea.businessModel?.keyResources}</p>
          </div>
        </div>
      </section>

      {/* Next Steps and Recommendations */}
      <section className="space-y-4">
        <h3 className="text-xl font-semibold">Next Steps</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {idea.nextSteps?.map((step, index) => (
            <div key={index} className="bg-white p-4 rounded-lg border">
              <div className="flex items-center space-x-2 mb-2">
                <div className="bg-blue-100 rounded-full w-6 h-6 flex items-center justify-center">
                  {index + 1}
                </div>
                <h4 className="font-semibold">{step.title}</h4>
              </div>
              <p className="text-sm text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );

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
            onClick={() => setActiveTab("saved")}
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
                  placeholder="Available Capital ($)"
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
                      handleArrayFieldChange("interests", index, e.target.value)
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
                    onClick={() => handleProfileChange("riskTolerance", level)}
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
                onChange={(e) => handleUserIdeaChange("description", e.target.value)}
              />
              <Input
                placeholder="Target Market"
                value={newUserIdea.targetMarket}
                onChange={(e) => handleUserIdeaChange("targetMarket", e.target.value)}
              />
              <Textarea
                placeholder="Competitive Advantage"
                value={newUserIdea.competitiveAdvantage}
                onChange={(e) => handleUserIdeaChange("competitiveAdvantage", e.target.value)}
              />
              <Textarea
                placeholder="Potential Challenges"
                value={newUserIdea.potentialChallenges}
                onChange={(e) => handleUserIdeaChange("potentialChallenges", e.target.value)}
              />
              <Input
                placeholder="Estimated Initial Investment ($)"
                type="number"
                value={newUserIdea.estimatedInitialInvestment}
                onChange={(e) => handleUserIdeaChange("estimatedInitialInvestment", e.target.value)}
              />
              <Button onClick={addUserIdea} className="w-full">
                <Plus className="h-4 w-4 mr-2" /> Add Idea
              </Button>

              {userBusinessIdeas.length > 0 && (
                <div className="mt-6 space-y-4">
                  <h3 className="font-semibold">Your Added Ideas</h3>
                  {userBusinessIdeas.map((idea, index) => (
                    <Card key={idea.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="pt-6">
                        <h4 className="font-medium mb-2">Idea {index + 1}: {idea.name}</h4>
                        <div className="space-y-2 text-sm text-gray-600">
                          <p><strong>Description:</strong> {idea.description}</p>
                          <p><strong>Target Market:</strong> {idea.targetMarket}</p>
                          <p><strong>Competitive Advantage:</strong> {idea.competitiveAdvantage}</p>
                          <p><strong>Potential Challenges:</strong> {idea.potentialChallenges}</p>
                          <p><strong>Estimated Investment:</strong> ${idea.estimatedInitialInvestment}</p>
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
                    <Card key={index} className="hover:shadow-lg transition-shadow">
                      <CardContent className="pt-6">
                        <h3 className="font-semibold text-lg mb-2">{idea.name}</h3>
                        <p className="text-gray-600 mb-4">{idea.description}</p>
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline">View Details</Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>{idea.name}</DialogTitle>
                              </DialogHeader>
                              <IdeaDetailModal idea={idea} />
                            </DialogContent>
                          </Dialog>
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
                </div>
              )}
              <Button
                onClick={generateIdeas}
                className="w-full"
              >
                {isLoading ? "Generating..." : "Generate Ideas"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Saved Ideas Tab */}
      {activeTab === "saved" && (
        <Card>
          <CardHeader>
            <CardTitle>Saved Business Ideas</CardTitle>
            <CardDescription>
              Here are your saved ideas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {savedIdeas.length === 0 ? (
                <Alert>
                  <DollarSign className="h-4 w-4" />
                  <AlertDescription>No saved ideas yet.</AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  {savedIdeas.map((idea, index) => (
                    <Card key={index}>
                      <CardContent className="pt-6">
                        <h3 className="font-semibold text-lg mb-2">{idea.name}</h3>
                        <p className="text-gray-600 mb-2">{idea.description}</p>
                        <p className="text-sm text-gray-500">
                          Saved at: {new Date(idea.savedAt).toLocaleString()}
                        </p>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" className="mt-2">
                              View Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>{idea.name}</DialogTitle>
                            </DialogHeader>
                            <IdeaDetailModal idea={idea} />
                          </DialogContent>
                        </Dialog>
                      </CardContent>
                    </Card>
                  ))}
                  <Button onClick={exportIdeas} className="w-full">
                    <Download className="h-4 w-4 mr-2" /> Export Ideas
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  </div>
);
}
export default BusinessIdeaGenerator;