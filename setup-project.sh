#!/bin/bash

# Create root directories
mkdir -p src/components/{ui,layout,forms,loading}
mkdir -p src/lib/{components,hooks}
mkdir -p src/styles/{components,themes}
mkdir -p src/tests

# Create UI components
cat > src/components/ui/Button.tsx << 'EOF'
import React from 'react';

export const Button: React.FC = () => {
  return <button>Button</button>;
};
EOF

cat > src/components/ui/Input.tsx << 'EOF'
import React from 'react';

export const Input: React.FC = () => {
  return <input type="text" />;
};
EOF

cat > src/components/ui/Modal.tsx << 'EOF'
import React from 'react';

export const Modal: React.FC = () => {
  return <div>Modal</div>;
};
EOF

# Create Layout components
cat > src/components/layout/Header.tsx << 'EOF'
import React from 'react';

export const Header: React.FC = () => {
  return <header>Header</header>;
};
EOF

cat > src/components/layout/Sidebar.tsx << 'EOF'
import React from 'react';

export const Sidebar: React.FC = () => {
  return <aside>Sidebar</aside>;
};
EOF

cat > src/components/layout/Grid.tsx << 'EOF'
import React from 'react';

export const Grid: React.FC = () => {
  return <div>Grid</div>;
};
EOF

# Create Form components
cat > src/components/forms/Form.tsx << 'EOF'
import React from 'react';

export const Form: React.FC = () => {
  return <form>Form</form>;
};
EOF

cat > src/components/forms/Select.tsx << 'EOF'
import React from 'react';

export const Select: React.FC = () => {
  return <select>Select</select>;
};
EOF

cat > src/components/forms/DatePicker.tsx << 'EOF'
import React from 'react';

export const DatePicker: React.FC = () => {
  return <input type="date" />;
};
EOF

# Create Loading components
cat > src/components/loading/Spinner.tsx << 'EOF'
import React from 'react';

export const Spinner: React.FC = () => {
  return <div>Loading...</div>;
};
EOF

cat > src/components/loading/Skeleton.tsx << 'EOF'
import React from 'react';

export const Skeleton: React.FC = () => {
  return <div>Skeleton</div>;
};
EOF

# Create utility functions
cat > src/lib/components/button.ts << 'EOF'
export const button = () => {
  return 'button';
};
EOF

cat > src/lib/components/input.ts << 'EOF'
export const input = () => {
  return 'input';
};
EOF

cat > src/lib/components/modal.ts << 'EOF'
export const modal = () => {
  return 'modal';
};
EOF

# Create hooks
cat > src/lib/hooks/useButton.ts << 'EOF'
export const useButton = () => {
  return {};
};
EOF

cat > src/lib/hooks/useInput.ts << 'EOF'
export const useInput = () => {
  return {};
};
EOF

cat > src/lib/hooks/useModal.ts << 'EOF'
export const useModal = () => {
  return {};
};
EOF

# Create style files
cat > src/styles/components/button.css << 'EOF'
.button {
  /* Button styles */
}
EOF

cat > src/styles/components/input.css << 'EOF'
.input {
  /* Input styles */
}
EOF

cat > src/styles/themes/light.css << 'EOF'
:root {
  /* Light theme variables */
}
EOF

cat > src/styles/themes/dark.css << 'EOF'
:root {
  /* Dark theme variables */
}
EOF

echo "Project structure created successfully!" 