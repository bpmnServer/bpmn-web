// ESM: test app delegate — thin subclass of the WorkflowApp delegate.
import { MyAppDelegate } from '../WorkflowApp/appDelegate.js';

console.log('----', import.meta.url);

export class TestAppDelegate extends MyAppDelegate {
}
