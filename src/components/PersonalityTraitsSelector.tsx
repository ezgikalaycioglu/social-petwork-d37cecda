
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X, Plus } from 'lucide-react';

interface PersonalityTraitsSelectorProps {
  selectedTraits: string[];
  onTraitsChange: (traits: string[]) => void;
}

const PREDEFINED_TRAITS = [
  'Friendly',
  'Playful',
  'Shy',
  'Energetic',
  'Calm',
  'Loves Kids',
  'Good with Dogs',
  'Good with Cats',
  'Protective',
  'Independent',
  'Affectionate',
  'Loyal'
];

const PersonalityTraitsSelector = ({ selectedTraits, onTraitsChange }: PersonalityTraitsSelectorProps) => {
  const [customTrait, setCustomTrait] = React.useState('');

  const handleTraitToggle = (trait: string, checked: boolean) => {
    if (checked) {
      onTraitsChange([...selectedTraits, trait]);
    } else {
      onTraitsChange(selectedTraits.filter(t => t !== trait));
    }
  };

  const addCustomTrait = () => {
    if (customTrait.trim() && !selectedTraits.includes(customTrait.trim())) {
      onTraitsChange([...selectedTraits, customTrait.trim()]);
      setCustomTrait('');
    }
  };

  const removeCustomTrait = (trait: string) => {
    onTraitsChange(selectedTraits.filter(t => t !== trait));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCustomTrait();
    }
  };

  return (
    <div className="space-y-4">
      {/* Predefined traits as chips */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {PREDEFINED_TRAITS.map((trait) => {
          const isSelected = selectedTraits.includes(trait);
          return (
            <button
              key={trait}
              type="button"
              role="checkbox"
              aria-checked={isSelected}
              data-selected={isSelected}
              onClick={() => handleTraitToggle(trait, !isSelected)}
              className="inline-flex items-center justify-center px-3 h-9 rounded-full border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 active:bg-gray-100 text-sm data-[selected=true]:bg-primary data-[selected=true]:text-white data-[selected=true]:border-transparent focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {trait}
            </button>
          );
        })}
      </div>

      {/* Custom traits input */}
      <div className="space-y-2">
        <p className="text-xs text-gray-600">Add custom trait:</p>
        <div className="flex gap-2">
          <Input
            placeholder="Enter custom trait"
            value={customTrait}
            onChange={(e) => setCustomTrait(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 rounded-lg border border-gray-200 bg-white h-9 px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40"
          />
          <Button
            type="button"
            onClick={addCustomTrait}
            disabled={!customTrait.trim()}
            className="h-9 px-3 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 focus:ring-2 focus:ring-green-300"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Selected custom traits display */}
      {selectedTraits.filter(trait => !PREDEFINED_TRAITS.includes(trait)).length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-gray-600">Custom traits:</p>
          <div className="flex flex-wrap gap-2">
            {selectedTraits
              .filter(trait => !PREDEFINED_TRAITS.includes(trait))
              .map((trait) => (
                <button
                  key={trait}
                  type="button"
                  onClick={() => removeCustomTrait(trait)}
                  className="inline-flex items-center gap-1 bg-primary text-white px-3 h-8 rounded-full text-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  aria-label={`Remove ${trait}`}
                >
                  <span>{trait}</span>
                  <X className="w-3 h-3" />
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonalityTraitsSelector;
