const mongoose = require('mongoose');

const IdeaSchema = new mongoose.Schema({
    idea_name: { type: String, required: true },
    short_description: { type: String },
    detailed_description: { type: String },
    required_capital: { type: String },
    time_to_market: { type: String }
});

const RecommendationSchema = new mongoose.Schema({
    summary: { type: String },
    ideas: [{
        idea_name: String,
        improvements: [String],
        differentiation_strategy: String
    }]
});

const PivotStrategySchema = new mongoose.Schema({
    summary: { type: String },
    strategies: [{
        original_idea: String,
        pivot_option: String,
        reason: String
    }]
});

const SuccessMetricSchema = new mongoose.Schema({
    summary: { type: String },
    ideas: [{
        idea_name: String,
        success_probability: Number,
        key_success_factors: [String]
    }]
});

const SWOTSchema = new mongoose.Schema({
    summary: { type: String },
    ideas: [{
        idea_name: String,
        strengths: [String],
        weaknesses: [String],
        opportunities: [String],
        threats: [String]
    }]
});

const TargetMarketSchema = new mongoose.Schema({
    summary: { type: String },
    audiences: [{
        idea_name: String,
        primary_audience: String,
        demographics: [String],
        psychographics: [String]
    }]
});

const ScalabilitySchema = new mongoose.Schema({
    summary: { type: String },
    opportunities: [{
        idea_name: String,
        growth_opportunities: [String],
        expansion_markets: [String],
        diversification_options: [String]
    }]
});

const BusinessModelSchema = new mongoose.Schema({
    summary: { type: String },
    models: [{
        idea_name: String,
        revenue_streams: [String],
        key_partnerships: [String],
        operational_requirements: String,
        estimated_margins: String
    }]
});

const SavedIdeaSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String },
    idea: IdeaSchema,
    recommendations: RecommendationSchema,
    pivot_strategies: PivotStrategySchema,
    success_metrics: SuccessMetricSchema,
    swot_analysis: SWOTSchema,
    target_market: TargetMarketSchema,
    scalability: ScalabilitySchema,
    business_model: BusinessModelSchema,
    savedAt: { type: Date, default: Date.now }
});

const SavedIdea = mongoose.model('SavedIdea', SavedIdeaSchema);

module.exports = SavedIdea;
