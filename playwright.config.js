import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'./e2e',use:{baseURL:'http://localhost:5173',launchOptions:{executablePath:'/usr/bin/chromium',args:['--no-sandbox']},viewport:{width:1440,height:1100}},workers:1});
