import React, { useState, useEffect, useMemo } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { Language, languages } from './types';

interface LanguageSelectorProps {
  language: string;
  setLanguage: React.Dispatch<React.SetStateAction<string>>;
}

const LanguageSelector = ({ language, setLanguage }: LanguageSelectorProps) => {
  // State to manage the current input value in the autocomplete field
  const [inputValue, setInputValue] = useState('');
  // State to manage the currently selected option
  const [selectedValue, setSelectedValue] = useState<Language | null>(null);

  // Extend your languages list to include an "Auto" option
  const optionsWithAuto = useMemo(() => [{ code: 'auto', name: 'Auto' }, ...languages], []);

  // Load the last selected language or "Auto" from localStorage on component mount
  useEffect(() => {
    const lastSelectedLanguageCode = localStorage.getItem('selectedLanguage') || 'auto';
    const lastSelectedLanguage =
      optionsWithAuto.find((lang) => lang.code === lastSelectedLanguageCode) || optionsWithAuto[0];
    setSelectedValue(lastSelectedLanguage);
    // If "Auto" was the last selected, don't preset the input value
    setInputValue(lastSelectedLanguageCode === 'auto' ? '' : lastSelectedLanguage.name);
  }, [optionsWithAuto]);

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
      renderInput={(params) => <TextField {...params} label='Select a language' />}
      isOptionEqualToValue={(option, value) => option.code === value.code}
      // Clear the input value when "Auto" is explicitly selected, allowing user to start typing from the beginning
      selectOnFocus
      clearOnBlur
      handleHomeEndKeys
    />
  );
};

export default LanguageSelector;
