import "./TemplateInfo.css";
import React from "react";
import type { PresentationTemplate } from "../../types/presentation";

interface TemplateInfoProps {
  template: PresentationTemplate;
}

const TemplateInfo: React.FC<TemplateInfoProps> = ({ template }) => {
  return (
    <div className="SETUP-template-info">
      <h2>{template.title}</h2>
      <p>{template.description}</p>
    </div>
  );
};

export default TemplateInfo;
