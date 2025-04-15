import { FaHome } from "react-icons/fa";
import { FaRandom } from "react-icons/fa";
import { GiPerspectiveDiceSixFacesRandom } from "react-icons/gi";
import { FaUserFriends } from "react-icons/fa";
import { IoIosSettings } from "react-icons/io";
import { FaSignOutAlt } from "react-icons/fa";


export function TabsSection(){
    const Tabs ={
        'Home' : <FaHome/>,
        'Random Match': <FaRandom/>,
        'Vs friend': <FaUserFriends/>,
        'Settings': <IoIosSettings/> ,
        'Sign Out': <FaSignOutAlt/>

    }
    
    return(
        <div>
            <div className="flex flex-col gap-14 justify-center">
                {Object.entries(Tabs).map(([label, Icon], index) => (
                    <div key={index} className=" flex gap-2 text-xl hover:selection">
                        {Icon}
                        <span>{label}</span>
                    </div>
                ))}
                </div>
        </div>
    )
}