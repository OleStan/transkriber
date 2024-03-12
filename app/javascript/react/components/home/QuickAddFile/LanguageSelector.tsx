import React, { useState, useEffect } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { Language } from './types';

interface LanguageSelectorProps {
  setLanguage: React.Dispatch<React.SetStateAction<string>>;
}

const languages: Language[] = [
  { code: 'af', name: 'Afrikaans' },
  { code: 'ar', name: 'Arabic' },
  { code: 'hy', name: 'Armenian' },
  { code: 'az', name: 'Azerbaijani' },
  { code: 'be', name: 'Belarusian' },
  { code: 'bs', name: 'Bosnian' },
  { code: 'bg', name: 'Bulgarian' },
  { code: 'ca', name: 'Catalan' },
  { code: 'zh', name: 'Chinese' },
  { code: 'hr', name: 'Croatian' },
  { code: 'cs', name: 'Czech' },
  { code: 'da', name: 'Danish' },
  { code: 'nl', name: 'Dutch' },
  { code: 'en', name: 'English' },
  { code: 'et', name: 'Estonian' },
  { code: 'fi', name: 'Finnish' },
  { code: 'fr', name: 'French' },
  { code: 'gl', name: 'Galician' },
  { code: 'de', name: 'German' },
  { code: 'el', name: 'Greek' },
  { code: 'he', name: 'Hebrew' },
  { code: 'hi', name: 'Hindi' },
  { code: 'hu', name: 'Hungarian' },
  { code: 'is', name: 'Icelandic' },
  { code: 'id', name: 'Indonesian' },
  { code: 'it', name: 'Italian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'kn', name: 'Kannada' },
  { code: 'kk', name: 'Kazakh' },
  { code: 'ko', name: 'Korean' },
  { code: 'lv', name: 'Latvian' },
  { code: 'lt', name: 'Lithuanian' },
  { code: 'mk', name: 'Macedonian' },
  { code: 'ms', name: 'Malay' },
  { code: 'mr', name: 'Marathi' },
  { code: 'mi', name: 'Maori' },
  { code: 'ne', name: 'Nepali' },
  { code: 'no', name: 'Norwegian' },
  { code: 'fa', name: 'Persian' },
  { code: 'pl', name: 'Polish' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ro', name: 'Romanian' },
  { code: 'ru', name: 'Russian' },
  { code: 'sr', name: 'Serbian' },
  { code: 'sk', name: 'Slovak' },
  { code: 'sl', name: 'Slovenian' },
  { code: 'es', name: 'Spanish' },
  { code: 'sw', name: 'Swahili' },
  { code: 'sv', name: 'Swedish' },
  { code: 'tl', name: 'Tagalog' },
  { code: 'ta', name: 'Tamil' },
  { code: 'th', name: 'Thai' },
  { code: 'tr', name: 'Turkish' },
  { code: 'uk', name: 'Ukrainian' },
  { code: 'ur', name: 'Urdu' },
  { code: 'vi', name: 'Vietnamese' },
  { code: 'cy', name: 'Welsh' },
];
const LanguageSelector: React.FC<LanguageSelectorProps> = ({ setLanguage }) => {
  // State to manage the current input value in the autocomplete field
  const [inputValue, setInputValue] = useState('');
  // State to manage the currently selected option
  const [selectedValue, setSelectedValue] = useState<Language | null>(null);

  // Extend your languages list to include an "Auto" option
  const optionsWithAuto: Language[] = [{ code: 'auto', name: 'Auto' }, ...languages];

  // Load the last selected language or "Auto" from localStorage on component mount
  useEffect(() => {
    const lastSelectedLanguageCode = localStorage.getItem('selectedLanguage') || 'auto';
    const lastSelectedLanguage = optionsWithAuto.find(lang => lang.code === lastSelectedLanguageCode) || optionsWithAuto[0];
    setSelectedValue(lastSelectedLanguage);
    // If "Auto" was the last selected, don't preset the input value
    setInputValue(lastSelectedLanguageCode === 'auto' ? '' : lastSelectedLanguage.name);
  }, []);

  const handleInputChange = (event: React.SyntheticEvent, newInputValue: string) => {
    setInputValue(newInputValue);
  };

  const handleChange = (event: React.SyntheticEvent, newValue: Language | null) => {
    setSelectedValue(newValue);
    setLanguage(newValue?.code || 'auto');
    localStorage.setItem('selectedLanguage', newValue?.code || 'auto');
    // When a language is selected from the dropdown, update the input value to reflect the selection
    if (newValue) {
      setInputValue(newValue.name);
    }
  };

  return (
    <Autocomplete
      value={selectedValue}
      onChange={handleChange}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      options={optionsWithAuto}
      getOptionLabel={(option) => option.name}
      renderInput={(params) => <TextField {...params} label="Select a language" />}
      isOptionEqualToValue={(option, value) => option.code === value.code}
      // Clear the input value when "Auto" is explicitly selected, allowing user to start typing from the beginning
      selectOnFocus
      clearOnBlur
      handleHomeEndKeys
    />
  );
};

export default LanguageSelector;
