import {createBrowserRouter, RouterProvider} from "react-router-dom";
import App from "@/App.tsx";
import StarkNetAirdrop from "@/pages/StarkNet";
import DeveloperAirdrop from "@/pages/Developer";

const routerConfig = [
    {
        path: '/',
        element: <App />,
        children: [
            {path: '/', element: <StarkNetAirdrop/>},
            {path: '/developer', element: <DeveloperAirdrop/>},
        ],
    },
];

const router = createBrowserRouter(routerConfig);

export const Router = () => {
    return (
        <RouterProvider router={router}/>
    )
}