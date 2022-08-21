import PutUserDto from './put.user.dto';

interface PatchUserDto extends Partial<PutUserDto> {}

export default PatchUserDto;