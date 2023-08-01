/**
 @license
 (C) Copyright Nuxeo Corp. (http://nuxeo.com/)

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */
 import { fixture, html } from '@nuxeo/testing-helpers';
 import '../widgets/nuxeo-file';
 
 suite('nuxeo-file', () => {
   let element;
   setup(async () => {
     element = await fixture(
       html`
         <nuxeo-file></nuxeo-file>
       `,
     );
   });
 
   suite('should return whether property is under retention', () => {
     test('when file:content is a retained property && xpath =  file:content', () => {
       const document = {
         isUnderRetentionOrLegalHold: true,
         retainedProperties: ['file:content'],
       };
       element.xpath = 'file:content';
       expect(element._isDropzoneVisible(document)).to.eql(true);
     });
     test('when file:content is not a retained property && xpath =  file:content', () => {
       const document = {
         isUnderRetentionOrLegalHold: true,
         retainedProperties: [],
       };
       element.xpath = 'file:content';
       expect(element._isDropzoneVisible(document)).to.eql(false);
     });
   });
 });
 
 
 
 
 
 
 