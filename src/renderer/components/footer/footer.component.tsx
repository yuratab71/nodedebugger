import { BottomNavigation, BottomNavigationAction } from "@mui/material";
import { Component, ReactNode } from "react";
import RestoreIcon from "@mui/icons-material/Restore";
import FavoriteIcon from "@mui/icons-material/Favorite";
import LocationOnIcon from "@mui/icons-material/LocationOn";

interface FooterProps {}
interface FoterState {}

export default class Footer extends Component<FooterProps, FoterState> {
    constructor(props: FooterProps) {
        super(props);
    }

    override render(): ReactNode {
        return (
            <>
                <BottomNavigation>
                    <BottomNavigationAction
                        label="Recents"
                        icon={<RestoreIcon />}
                    />
                    <BottomNavigationAction
                        label="Favorites"
                        icon={<FavoriteIcon />}
                    />
                    <BottomNavigationAction
                        label="Nearby"
                        icon={<LocationOnIcon />}
                    />
                </BottomNavigation>
            </>
        );
    }
}
