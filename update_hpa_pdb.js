const fs = require('fs');
const path = require('path');

const services = ['auth-service', 'user-service', 'appointment-service', 'document-service', 'notification-service', 'ai-service', 'frontend'];
const templatesDir = path.join('c:', 'Users', 'admin', 'Desktop', 'aws-final-project', 'caresync-gitops', 'helm', 'templates');

for (const service of services) {
    // 1. Update HPA
    const hpaPath = path.join(templatesDir, service, 'hpa.yaml');
    if (fs.existsSync(hpaPath)) {
        let content = fs.readFileSync(hpaPath, 'utf8');
        content = content.replace(/maxReplicas:\s*\d+/g, 'maxReplicas: 3');
        fs.writeFileSync(hpaPath, content, 'utf8');
        console.log(`Updated HPA for ${service}`);
    } else {
        console.warn(`hpa.yaml not found for ${service}`);
    }

    // 2. Create PDB
    const pdbPath = path.join(templatesDir, service, 'pdb.yaml');
    const pdbContent = `apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: ${service}-pdb
  namespace: {{ .Values.namespace }}
  labels:
    app: ${service}
spec:
  minAvailable: 1
  selector:
    matchLabels:
      app: ${service}
`;
    fs.writeFileSync(pdbPath, pdbContent, 'utf8');
    console.log(`Created PDB for ${service}`);
}
