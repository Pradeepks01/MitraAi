from flask import request, jsonify
from utils.resume_scorer import score_resume

def analyze_resume():
    try:
        data = request.get_json()
        resume_text = data.get('resume_text', '')
        job_description = data.get('job_description', '')

        if not resume_text:
             return jsonify({'error': 'Resume text is required'}), 400

        # Use enhanced deterministic scoring
        analysis = score_resume(resume_text, job_description)
        
        if 'error' in analysis:
            response_text = f"""
**ATS Score**
0/100

**Strengths**
* **N/A**

**Weaknesses**
* **Invalid Document:** {analysis['message']}

**Suggestions**
* **Re-upload:** Please upload a valid professional resume (PDF) to proceed.
"""
            return jsonify({'analysis': response_text}), 200

        score = analysis['final_score']
        breakdown = analysis['breakdown']
        missing_sections = analysis['missing_sections']
        impact_count = analysis['impact_count']
        matched = analysis['matched_keywords']
        missing_kw = analysis['missing_keywords']

        # Construct Analysis Report
        
        # Strengths Construction
        strengths_parts = []
        if breakdown['structure'] == 20:
            strengths_parts.append("* **Structure:** Resume follows a complete and professional structure with all key sections present.")
        if impact_count >= 3:
            strengths_parts.append(f"* **Impact:** Good use of quantifiable metrics (found {impact_count} instances) to demonstrate achievements.")
        if len(matched) > 0:
            top_k = ", ".join(matched[:5])
            strengths_parts.append(f"* **Relevance:** Strong alignment with job keywords: {top_k}.")
        
        # New Semantic Checking
        if breakdown.get('semantic_match', 0) > 75:
            strengths_parts.append("* **Contextual Analysis:** High semantic similarity to the job description indicates strong fit beyond just keywords.")
        
        if not strengths_parts:
             strengths_parts.append("* **Content:** Resume has sufficient length and detail for analysis.")

        strengths_str = "\n".join(strengths_parts)

        # Weaknesses Construction
        weaknesses_parts = []
        if missing_sections:
            ms = ", ".join(missing_sections)
            weaknesses_parts.append(f"* **Missing Sections:** Critical sections appear to be missing or mislabeled: {ms}.")
        if impact_count < 2:
            weaknesses_parts.append("* **Quantifiable Results:** Lacks specific metrics (%, $) to prove impact. Use numbers to tell your story.")
        if len(missing_kw) > 0:
            mk = ", ".join(missing_kw)
            weaknesses_parts.append(f"* **Keywords:** Missing important keywords for this role: {mk}.")
            
        weaknesses_str = "\n".join(weaknesses_parts)
        
        # Suggestions Construction
        suggestions_parts = []
        suggestions_parts.append("* **Action Verbs:** Ensure every bullet point starts with a strong action verb (e.g., 'Lead', 'Developed').")
        if impact_count < 3:
             suggestions_parts.append("* **Add Metrics:** Try to rewrite one bullet point per role using the 'X-Y-Z' formula: 'Accomplished [X] as measured by [Y], by doing [Z]'.")
        if missing_sections:
             suggestions_parts.append("* **Reorganize:** Add clear headers for the missing sections identified above.")
        
        suggestions_str = "\n".join(suggestions_parts)

        response_text = f"""
**ATS Score**
{score}/100

**Strengths**
{strengths_str}

**Weaknesses**
{weaknesses_str}

**Suggestions**
{suggestions_str}
"""
        return jsonify({'analysis': response_text}), 200

    except Exception as e:
        print(f"Error in analyze_resume: {e}")
        return jsonify({'error': str(e)}), 500
