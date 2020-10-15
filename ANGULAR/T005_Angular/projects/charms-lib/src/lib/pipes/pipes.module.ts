import { NgModule } from '@angular/core';

import { KeysPipe } from './keys.pipe';
import { GetByIdPipe } from './getById.pipe';
import { HtmlToPlaintextPipe } from './htmlToPlaintext.pipe';
import { FilterPipe } from './filter.pipe';
import { CamelCaseToDashPipe } from './camelCaseToDash.pipe';
import { DecryptionPipe } from './decrypt.pipe';
import { ChiEpisodeNumPipe } from './episode-num.pipe';
import { SentenceCasePipe } from './sentence-case-pipe';

@NgModule({
    declarations: [
        KeysPipe,
        GetByIdPipe,
        HtmlToPlaintextPipe,
        FilterPipe,
        CamelCaseToDashPipe,
        DecryptionPipe,
        ChiEpisodeNumPipe,
        SentenceCasePipe
    ],
    imports     : [],
    exports     : [
        KeysPipe,
        GetByIdPipe,
        HtmlToPlaintextPipe,
        FilterPipe,
        CamelCaseToDashPipe,
        DecryptionPipe,
        ChiEpisodeNumPipe,
        SentenceCasePipe
    ]
})
export class FusePipesModule
{
}
