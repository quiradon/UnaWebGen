import React from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import DiceNotationEditor from "./DiceNotationEditor";

interface DiceNotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  value: string;
  onChange: (value: string) => void;
  onConfirm: (value: string) => void;
  stats?: any[];
  title?: string;
}

const DiceNotationModal: React.FC<DiceNotationModalProps> = ({
  isOpen,
  onClose,
  value,
  onChange,
  onConfirm,
  stats = [],
  title = "Editor de Dice Notation"
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="flex w-[calc(100%-2rem)] max-w-3xl max-h-[85vh] flex-col overflow-hidden rounded-xl bg-background shadow-lg">
        <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
          <h3 className="text-sm font-semibold">{title}</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Fechar"
            title="Fechar"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <DiceNotationEditor
            value={value}
            onChange={onChange}
            stats={stats}
            onConfirm={onConfirm}
          />
        </div>
      </div>
    </div>
  );
};

export default DiceNotationModal;
