import React from 'react';

interface ContainerProps {
  children: React.ReactNode;
}

function Container({ children }: ContainerProps): React.ReactElement {
  return <div className='w-full max-w-7xl mx-auto px-4 my-container'>{children}</div>;
}

export default Container;
