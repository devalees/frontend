import React from 'react';

interface FooterProps {
  copyright?: string;
  children?: React.ReactNode;
}

export const Footer: React.FC<FooterProps> = ({
  copyright = `© ${new Date().getFullYear()} All rights reserved`,
  children
}) => {
  return (
    <footer className="footer">
      <div className="footer-content">
        {children}
      </div>
      <div className="copyright">
        {copyright}
      </div>
    </footer>
  );
}; 