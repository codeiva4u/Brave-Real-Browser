# 📦 Auto-Update Features Guide | ऑटो-अपडेट फीचर्स गाइड

## 🌟 Overview | परिचय

This project has **multiple automatic dependency update systems** to ensure all packages stay on the latest versions.

इस project में **कई automatic dependency update systems** हैं जो सुनिश्चित करते हैं कि सभी packages latest versions पर रहें।

---

## 🔄 Auto-Update Methods | ऑटो-अपडेट के तरीके

### 1️⃣ **GitHub Actions Workflow** (Automatic)

**English:**
- Runs automatically on every push to `main` branch
- Updates all dependencies to latest versions before publishing
- Auto-increments version and publishes to NPM

**हिंदी:**
- हर `main` branch push पर automatically चलता है
- Publishing से पहले सभी dependencies को latest versions में update करता है
- Version auto-increment करके NPM पर publish करता है

**Location:** `.github/workflows/publish.yml`

---

### 2️⃣ **Dependabot** (GitHub Native)

**English:**
- Automatically checks for updates **every Monday at 9 AM**
- Creates Pull Requests for dependency updates
- Groups all dependencies together for easier management

**हिंदी:**
- **हर सोमवार सुबह 9 बजे** automatically updates check करता है
- Dependency updates के लिए Pull Requests बनाता है
- सभी dependencies को एक साथ group करता है

**Configuration:** `.github/dependabot.yml`

**To Enable:**
1. Go to repository settings
2. Enable Dependabot alerts and security updates
3. Dependabot will start working automatically

---

### 3️⃣ **Renovate Bot** (Advanced)

**English:**
- More powerful than Dependabot
- Auto-updates **every weekend**
- Can auto-merge minor/patch updates
- Creates a dependency dashboard

**हिंदी:**
- Dependabot से ज्यादा powerful
- **हर weekend** auto-update करता है
- Minor/patch updates को auto-merge कर सकता है
- Dependency dashboard बनाता है

**Configuration:** `renovate.json`

**To Enable:**
1. Install Renovate GitHub App: https://github.com/apps/renovate
2. Select your repository
3. Renovate will start working automatically

---

## 🛠️ Manual Update Commands | मैनुअल अपडेट कमांड्स

### Check for Outdated Dependencies | पुराने Dependencies देखें
```bash
npm run check-updates
```

### Update All Dependencies to Latest | सभी Dependencies को Latest में Update करें
```bash
npm run update-deps
# या
npm run upgrade-all
```

### Install with Pre/Post Scripts | Pre/Post Scripts के साथ Install करें
```bash
npm install
```
यह automatically:
- पहले check करेगा कि updates available हैं या नहीं
- बाद में update करने का message दिखाएगा

---

## 📋 Available NPM Scripts | उपलब्ध NPM Scripts

| Command | Description (English) | विवरण (हिंदी) |
|---------|----------------------|---------------|
| `npm install` | Installs dependencies with pre/post hooks | Pre/post hooks के साथ dependencies install करता है |
| `npm run check-updates` | Shows outdated packages | पुराने packages दिखाता है |
| `npm run update-deps` | Updates all deps to latest | सभी deps को latest में update करता है |
| `npm run upgrade-all` | Same as update-deps with message | update-deps जैसा ही message के साथ |
| `npm run esm_test` | Run ESM module test | ESM module test चलाता है |
| `npm run cjs_test` | Run CommonJS test | CommonJS test चलाता है |

---

## 🎯 Which Update Method Should I Use? | कौन सा Update Method Use करूं?

### For Automatic Updates | Automatic Updates के लिए

1. **Best Option:** Enable both Dependabot + Renovate
   - Dependabot for security updates
   - Renovate for feature updates
   
2. **GitHub Actions Workflow** is already active
   - No setup needed
   - Updates happen on every publish

### For Manual Updates | Manual Updates के लिए

```bash
# Quick update
npm run upgrade-all

# Check what will be updated first
npm run check-updates
npm run update-deps
```

---

## 🔐 Security | सुरक्षा

Both Dependabot and Renovate automatically:
- Create security alerts for vulnerable packages
- Prioritize security updates
- Test updates before merging

दोनों Dependabot और Renovate automatically:
- Vulnerable packages के लिए security alerts बनाते हैं
- Security updates को priority देते हैं
- Merging से पहले updates को test करते हैं

---

## 🚀 Workflow Integration | वर्कफ्लो इंटीग्रेशन

The GitHub Actions workflow automatically:
1. ✅ Updates dependencies to latest
2. ✅ Runs tests (when available)
3. ✅ Increments version
4. ✅ Publishes to NPM
5. ✅ Creates GitHub release
6. ✅ Pushes changes back to repo

GitHub Actions workflow automatically:
1. ✅ Dependencies को latest में update करता है
2. ✅ Tests चलाता है (जब available हों)
3. ✅ Version increment करता है
4. ✅ NPM पर publish करता है
5. ✅ GitHub release बनाता है
6. ✅ Changes को repo में वापस push करता है

---

## 📞 Support | सहायता

For issues or questions:
- Create an issue on GitHub
- Check existing issues first

समस्याओं या सवालों के लिए:
- GitHub पर issue बनाएं
- पहले existing issues देखें

---

## 🎉 Summary | सारांश

**Your project now has 3 layers of auto-update protection:**

आपके project में अब **3 layers की auto-update सुरक्षा** है:

1. ✅ GitHub Actions Workflow (हर publish पर)
2. ✅ Dependabot (हर सोमवार)
3. ✅ Renovate Bot (हर weekend)

**Plus manual commands when you need them!**

**साथ ही manual commands भी जब आपको जरूरत हो!**

---

Made with ❤️ for automatic dependency management
