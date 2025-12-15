# SMART PANTRY APP

### Steps to Run App:
1. Clone the app from GitHub
2. Navigate into the cloned folder
3. Run `npm install` to install all packages using npm
4. Install XCode for IOS app development if not already installed (may require updating computer software to ensure the newest version works)
5. Follow the instructions [here](https://docs.expo.dev/get-started/set-up-your-environment/?platform=ios&device=simulated) to get your environment set up using Expo Go
6. Create an Expo Account if needed using [this link](https://expo.dev/signup?utm_term=&utm_campaign=Iteration+Speed&utm_source=adwords&utm_medium=ppc&hsa_acc=6617584976&hsa_cam=23330869816&hsa_grp=190613512938&hsa_ad=786713430636&hsa_src=g&hsa_tgt=dsa-3500001&hsa_kw=&hsa_mt=b&hsa_net=adwords&hsa_ver=3&gad_source=1&gad_campaignid=23330869816&gbraid=0AAAAApZvKwEWeuqLIOuYxwf3k8BS4xaCV&gclid=CjwKCAiA3fnJBhAgEiwAyqmY5Rk9mAdktZAhuiv8dkP3r1Vb5qRTlghCpeHG0I9kPy2EESiq5kzMyBoCNTcQAvD_BwE)
7. Run `npx expo start` to start the app. Either type `i` into the command terminal to load the IOS viewer using a simulator, or scan the QR code provided with the Expo Go App (downloadable on the App Store)
8. Once the app has loaded, either log in/sign up to create an account, or preview the app with guest features by hitting the "Back" button.
9. For more information about the app, in the three bars that are visible from the main app page click on "Instructions" for more information or potential options in the app. 

### Dependencies:
- npm install
- npm install expo-barcode-scanner
- npm install @supabase/supabase-js

### Testing
Testing framework: jest
Testing library: @testing-library/react-native

- npx expo install jest-expo jest @types/jest --dev
- npx expo install @testing-library/react-native --dev
