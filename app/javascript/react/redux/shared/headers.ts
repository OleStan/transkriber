import ReactOnRails from 'react-on-rails';

export const getCsrfTokenHeader = () => {
  return {
    'X-CSRF-Token': ReactOnRails.authenticityToken(),
  };
};
