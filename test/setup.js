import { expect, assert, use } from 'chai';
import sinonChai from 'sinon-chai';
import sinon from 'sinon';

use(sinonChai);

window.expect = expect;
window.assert = assert;
window.sinon = sinon;
