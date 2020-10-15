import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'sentenceCase'})
export class SentenceCasePipe implements PipeTransform
{
    transform(value: string, args: any[] = []): string
    {
        if (!value)
        {
            return null;
        }
        const subStr = value.substr(0, 1);
        const otherStr = value.substring(1, value.length);
        return subStr.toUpperCase() + otherStr.toLowerCase();
    }
}