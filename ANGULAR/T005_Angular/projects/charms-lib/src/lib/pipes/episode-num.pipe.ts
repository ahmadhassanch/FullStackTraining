import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'episodenum'})
export class ChiEpisodeNumPipe implements PipeTransform
{
    transform(value: any, args: any[] = []): string
    {
        if(!value) return '';

        const v = ('' + value).padStart(4, '0');
        return `CHI-EP-${v}`;
    }
}
