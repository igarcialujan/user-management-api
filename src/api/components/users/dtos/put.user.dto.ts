interface PutUserDto {
    id: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    permissionFlags: number;
}

export default PutUserDto;