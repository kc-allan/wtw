import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'wtw:isPublic';

/** Opts a route out of the globally applied access-token guard. */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
