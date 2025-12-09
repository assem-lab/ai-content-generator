import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BUCKETS = {
    test: 'ai-content-gen-test-frontend',
    prod: 'ai-content-gen-prod-frontend'
};

function deploy(env = 'test') {
    console.log(`🚀 Deploying to ${env.toUpperCase()} environment\n`);

    const bucket = BUCKETS[env];
    if (!bucket) {
        console.error('❌ Unknown environment. Use: test or prod');
        process.exit(1);
    }

    try {
        // 1. Build
        console.log('🔨 Step 1: Building project...');
        execSync('npm run build', { stdio: 'inherit' });

        // 2. Create bucket if not exists
        console.log(`\n📦 Step 2: Setting up bucket ${bucket}...`);
        try {
            execSync(`gsutil ls gs://${bucket}`, { stdio: 'pipe' });
            console.log('✅ Bucket exists');
        } catch {
            console.log('🆕 Creating bucket...');
            execSync(`gsutil mb -l europe-west1 gs://${bucket}`, { stdio: 'inherit' });
        }

        // 3. Upload
        console.log(`\n⬆️  Step 3: Uploading files...`);
        execSync(`gsutil -m rsync -R dist/ gs://${bucket}/`, { stdio: 'inherit' });

        // 4. Set permissions
        console.log('\n🔓 Step 4: Setting permissions...');
        execSync(`gsutil iam ch allUsers:objectViewer gs://${bucket}`, { stdio: 'inherit' });

        // 5. Configure static website
        console.log('\n🌐 Step 5: Configuring website...');
        execSync(`gsutil web set -m index.html -e index.html gs://${bucket}`, { stdio: 'inherit' });

        // 6. CORS
        console.log('\n🔄 Step 6: Configuring CORS...');
        const corsConfig = [{
            origin: ['*'],
            method: ['GET', 'POST', 'PUT', 'DELETE', 'HEAD'],
            responseHeader: ['Content-Type', 'Authorization'],
            maxAgeSeconds: 3600
        }];

        const corsFile = path.join(__dirname, 'cors-temp.json');
        fs.writeFileSync(corsFile, JSON.stringify(corsConfig, null, 2));
        execSync(`gsutil cors set ${corsFile} gs://${bucket}`, { stdio: 'inherit' });
        fs.unlinkSync(corsFile);

        // 7. Success
        console.log('\n🎉 DEPLOYMENT COMPLETED!');
        console.log(`\n📋 Summary:`);
        console.log(`   Environment: ${env}`);
        console.log(`   Bucket: ${bucket}`);
        console.log(`   URL: https://storage.googleapis.com/${bucket}/`);
        console.log(`\n🔗 Direct link: https://storage.googleapis.com/${bucket}/index.html`);

        // Save info
        const info = `Deployed: ${new Date().toISOString()}\nURL: https://storage.googleapis.com/${bucket}/\n`;
        fs.writeFileSync(`deployment-${env}.txt`, info);

    } catch (error) {
        console.error('\n❌ Deployment failed:', error.message);
        console.error('\n🔧 Check: gcloud auth login, gcloud config set project');
        process.exit(1);
    }
}

const env = process.argv[2] || 'test';
deploy(env);