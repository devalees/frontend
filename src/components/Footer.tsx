import React, { ReactNode } from 'react';

interface FooterProps {
  children?: ReactNode;
  copyrightText?: string;
}

const Footer: React.FC<FooterProps> = ({ 
  children, 
  copyrightText = '© 2024 All rights reserved.'
}) => {
  return (
    <footer className="footer">
      <div className="footer-content">
        {children}
      </div>
      <div className="footer-copyright">
        <p>{copyrightText}</p>
      </div>
    </footer>
  );
};

export default Footer; 