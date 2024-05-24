const { execSync } = require('child_process');
const os = require('os');

function installPoppler() {
    const platform = os.platform();

    try {
        switch (platform) {
            case 'darwin': // macOS
                console.log('Installing Poppler on macOS...');
                execSync('brew install poppler', { stdio: 'inherit' });
                break;
            case 'linux': // Linux
                console.log('Installing Poppler on Linux...');
                execSync('sudo apt-get install -y poppler-utils', { stdio: 'inherit' });
                break;
            case 'win32': // Windows (assuming Chocolatey is installed)
                console.log('Installing Poppler on Windows...');
                execSync('choco install poppler', { stdio: 'inherit' });
                break;
            default:
                console.error(`Unsupported platform: ${platform}`);
                break;
        }
    } catch (error) {
        console.error(`Failed to install Poppler: ${error.message}`);
    }
}

installPoppler();
