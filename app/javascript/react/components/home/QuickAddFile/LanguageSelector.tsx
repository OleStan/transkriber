import React from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { Language } from './types';

interface LanguageSelectorProps {
  language: string;
  setLanguage: React.Dispatch<React.SetStateAction<string>>;
  languages: Language[];
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ language, setLanguage, languages }) => {
  // Add an "Auto" option to the list of languages for the dropdown.
  const optionsWithAuto = [{ code: 'auto', name: 'Auto' }, ...languages];

  const handleChange = (event: React.SyntheticEvent, newValue: Language | null) => {
    setLanguage(newValue?.code || 'auto'); // Assuming 'auto' is the code for "Auto"
  };

  // Ensure "Auto" is selected by default or the last selected language is used
  const defaultValue = optionsWithAuto.find(lang => lang.code === language) || optionsWithAuto[0];

  return (
    <Autocomplete
      value={defaultValue}
      onChange={handleChange}
      options={optionsWithAuto}
      getOptionLabel={(option) => option.name}
      renderInput={(params) => <TextField {...params} label="Select a language" />}
      isOptionEqualToValue={(option, value) => option.code === value.code}
    />
  );
};

export default LanguageSelector;
