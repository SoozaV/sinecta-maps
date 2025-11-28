import { memo } from 'react';

export const Loading = memo(() => {
  return (
    <div className="loading-map d-flex justify-content-center align-items-center">
      <div className="text-center">
        <h3>Espere por favor</h3>
        <span>Localizando...</span>
      </div>
    </div>
  );
});

Loading.displayName = 'Loading';
