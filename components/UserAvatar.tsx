import React from 'react';
import { User } from 'next-auth';
import Avatar from "react-avatar";
import Image from "next/image";

type Props = {
    user: Pick<User, 'name' | 'image'>;
}

const UserAvatar = (props: Props) => {
    const { user } = props;
    const placeholderImage = "/path/to/your/image.png"; // Update this path accordingly

    return (
        <div className="avatar-container" style={{ width: '50px', height: '50px' }}> {/* Adjust size as needed */}
            {user.image ? (
                <div className='relative w-full h-full aspect-square'>
                    <Image
                        layout="fill"
                        src={user.image}
                        alt="profile image"
                        referrerPolicy="no-referrer"
                    />
                </div>
            ) : (
                <div className='relative w-full h-full aspect-square'>
                    <Image
                        layout="fill"
                        src={placeholderImage}
                        alt="default profile image"
                        referrerPolicy="no-referrer"
                    />
                </div>
            )}
        </div>
    )
}

export default UserAvatar;
