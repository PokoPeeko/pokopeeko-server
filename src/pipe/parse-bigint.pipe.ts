import { BadRequestException, Injectable, PipeTransform } from "@nestjs/common";

@Injectable()
export class ParseBigIntPipe implements PipeTransform<string, bigint> {
    transform(value: string): bigint {
        if (!/^\d+$/.test(value)) {
            throw new BadRequestException(
                'Validation failed (bigint string is expected)',
            );
        }

        return BigInt(value);
    }
}
