# Quick Start Guide - Bloom Budget Tracker

## Running the Application

### First Time Setup

1. **Install Dependencies** (only needed once)
   ```bash
   cd app
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Open in Browser**
   - The app will automatically open at `http://localhost:5173`
   - Or manually open: http://localhost:5173

### Daily Usage

Once dependencies are installed, just run:
```bash
cd app
npm run dev
```

## Other Commands

### Run Tests
```bash
npm test
```

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run build
npm run preview
```

## Troubleshooting

### Port Already in Use
If port 5173 is busy, Vite will automatically use the next available port (5174, 5175, etc.)

### Dependencies Not Installing
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Build Errors
```bash
# Clean build
npm run build
```

## Using the App

### First Steps

1. **Create Your First Account**
   - Click "+ Add Account" button
   - Choose account type (bank, wallet, cash, or card)
   - Enter name and initial balance
   - Pick a color
   - Click "Create Account"

2. **Add Income**
   - Click "Add Income" button
   - Select account
   - Enter amount
   - Choose category (Salary, Business, etc.)
   - Add description
   - Click "Add Income"

3. **Add Expense**
   - Click "Add Expense" button
   - Select account
   - Enter amount
   - Choose category (Food, Transport, etc.)
   - Add description
   - Click "Add Expense"

4. **Transfer Money** (requires 2+ accounts)
   - Click "Transfer Between Accounts"
   - Select source account
   - Select destination account
   - Enter amount
   - Click "Transfer Money"

### Tips

- Click on any account card to see details
- Your data is saved automatically in your browser
- Works completely offline
- No login required

## Next Steps

- Check `README.md` for full feature list
- See `TESTING.md` for test documentation
- Read `DEPLOYMENT.md` when ready to deploy

---

**Need Help?**
- Check browser console (F12) for errors
- Verify Node.js 18+ is installed: `node --version`
- Make sure you're in the `app` directory
