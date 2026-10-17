// ESM: test app delegate — thin subclass of the sample application delegate.
import { MyAppDelegate } from '../sample-app/appDelegate.js';

console.log('----', import.meta.url);

export class TestAppDelegate extends MyAppDelegate {
}
