import "./TemplatesGrid.css";
import React from "react";
import PresentationCard from "../PresentationCard/PresentationCard";
import type { PresentationTemplate } from "../../types/presentation";

interface TemplatesGridProps {
  templates: PresentationTemplate[];
  onSelect: (id: number) => void;
}

const TemplatesGrid: React.FC<TemplatesGridProps> = ({
  templates,
  onSelect,
}) => {
  return (
    <>
      {templates.map((template) => (
        <PresentationCard
          key={template.id}
          image={template.images[0]?.image}
          title={template.title}
          text={template.description}
          onSelect={() => onSelect(template.id)}
        />
      ))}
    </>
  );
};

export default TemplatesGrid;
