import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "../ui/card";
import CustomWordCloud from "@/components/ui/CustomWordCloud";

import React from 'react';

type Props ={}

const TopicsCard = (props: Props) => {
    return(
        <Card className='col-span-4'>
            <CardHeader>
                <CardTitle className='text-2xl font-bold '> Topics </CardTitle>
                <CardDescription>
                     Click on a topic to start a quiz on it!
                </CardDescription>
            </CardHeader>
              <CardContent className="pl-2"> 
                <CustomWordCloud/>
               </CardContent>
        </Card>
    )
}

export default TopicsCard;