import { BCryptPassword } from '../../../../shared/adapters/crypto';
import { JwtToken } from '../../../../shared/adapters/jwt';
import { CustomError } from '../../../../shared/errors';
import { UserSharedRepository } from '../../../../shared/infra/repositories';
import { LoginDTO, LoginDetailDTO } from '../dtos';

export class LoginUseCase {
    async execute(loginDTO: LoginDTO): Promise<LoginDetailDTO> {
        const repository = new UserSharedRepository();
        const bcrypt = new BCryptPassword();

        const user = await repository.getUserByEmail(loginDTO.email, {
            withPassword: true,
        });

        if (!user) throw new CustomError('Incorret email or password.');

        const correctPassword = await bcrypt.comparePassword(
            loginDTO.password,
            user.password as string,
        );

        if (!correctPassword) throw new CustomError('Incorret a email or password.');

        const jwtToken = new JwtToken();

        const userData = {
            id: user.id,
            name: user.name,
            email: user.email,
            profile: user.profile,
            company: user.company,
        };

        const token = jwtToken.sign(userData);
        return {
            ...userData,
            token,
        };
    }
}
