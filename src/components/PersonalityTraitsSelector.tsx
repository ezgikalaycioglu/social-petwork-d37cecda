
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
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
      {/* Predefined traits */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-gray-700">Select personality traits:</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {PREDEFINED_TRAITS.map((trait) => (
            <div key={trait} className="flex items-center space-x-2">
              <Checkbox
                id={trait}
                checked={selectedTraits.includes(trait)}
                onCheckedChange={(checked) => handleTraitToggle(trait, checked as boolean)}
              />
              <label
                htmlFor={trait}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {trait}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Custom traits */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700">Add custom trait:</p>
        <div className="flex gap-2">
          <Input
            placeholder="Enter custom personality trait"
            value={customTrait}
            onChange={(e) => setCustomTrait(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          <Button
            type="button"
            size="sm"
            onClick={addCustomTrait}
            disabled={!customTrait.trim()}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Selected custom traits */}
      {selectedTraits.filter(trait => !PREDEFINED_TRAITS.includes(trait)).length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Custom traits:</p>
          <div className="flex flex-wrap gap-2">
            {selectedTraits
              .filter(trait => !PREDEFINED_TRAITS.includes(trait))
              .map((trait) => (
                <div
                  key={trait}
                  className="flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm"
                >
                  <span>{trait}</span>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-4 w-4 p-0 hover:bg-green-200"
                    onClick={() => removeCustomTrait(trait)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonalityTraitsSelector;
