import { useState } from "react";
import FilterBox from "~/components/FilterBox";

const IndexPage: React.FC = () => {
  const [isFilterBoxOpen, setIsFilterBoxOpen] = useState<boolean>(true);

  const resetFilter = () => {
    // console.log("reset filter");
  };

  const toggleFilterBox = () => setIsFilterBoxOpen(!isFilterBoxOpen);

  // const renderOptions = (
  //   options: { id: number; title: string; handler: () => void }[]
  // ) =>
  //   options.map((option) => (
  //     <div
  //       key={option.id}
  //       className="flex cursor-pointer items-center justify-between p-2 hover:bg-gray-200"
  //       onClick={option.handler}
  //     >
  //       <p className="text-gray-700">{option.title}</p>
  //       <button className="text-gray-700 hover:text-gray-900">
  //         <svg
  //           xmlns="http://www.w3.org/2000/svg"
  //           className="h-5 w-5"
  //           viewBox="0 0 20 20"
  //           fill="currentColor"
  //         >
  //           <path
  //             fillRule="evenodd"
  //             d="M16.707 3.293a1 1 0 00-1.414 0L10 8.586 5.707 4.293a1 1 0 00-1.414 1.414L8.586 10l-4.293 4.293a1 1 0 101.414 1.414L10 11.414l4.293 4.293a1 1 0 001.414-1.414L11.414 10l4.293-4.293a1 1 0 000-1.414z"
  //             clipRule="evenodd"
  //           />
  //         </svg>
  //       </button>
  //     </div>
  //   ));

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white p-4 shadow-md md:p-8">
        <h1 className="mb-4 text-2xl font-bold">My Next.js Page</h1>
        <button
          className="rounded-md bg-gray-100 px-2 py-1 hover:bg-gray-200"
          onClick={toggleFilterBox}
        >
          Filter opties
        </button>
      </div>
      <div className="p-4 md:p-8">
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ac ex non
          felis bibendum viverra eget nec orci. Nulla facilisi. Vestibulum
          blandit augue a faucibus aliquam. Etiam et neque pretium, lacinia quam
          ut, volutpat mi. Pellentesque semper augue quis tortor pharetra, sed
          sagittis ante suscipit. Cras lobortis velit eu sapien consectetur
          porttitor. Etiam ac nunc tellus. Nulla facilisi. Ut ullamcorper orci
          sed magna fermentum, vel porttitor magna scelerisque. Sed consectetur
          ante et elit lobortis, ut rhoncus elit lobortis. Donec placerat leo
          quis lobortis tincidunt. Nam id nisl nec orci pharetra tincidunt.
          Aliquam gravida enim non fermentum fringilla.
        </p>
        <p>
          Pellentesque habitant morbi tristique senectus et netus et malesuada
          fames ac turpis egestas. Nam suscipit felis vel purus facilisis, vel
          feugiat sapien porttitor. Nulla vitae convallis lacus. Ut eget massa
          dui. Integer commodo, mi eget suscipit bibendum, dui est malesuada
          velit, a accumsan ipsum tortor et purus. Praesent eget feugiat sapien,
          sit amet commodo nisl. Integer interdum vel tortor in suscipit. In hac
          habitasse platea dictumst. Ut malesuada ipsum vel mi feugiat pharetra.
          Duis et maximus nulla. In nec eleifend odio. Praesent sit amet diam
          leo. Sed commodo sem eget risus scelerisque, ac rhoncus mi consequat.
          Ut consequat, odio eget tincidunt tristique, risus quam pharetra nibh,
          vel commodo ante velit a odio. Sed id nunc in velit hendrerit aliquet
          vel nec libero.
        </p>
      </div>
      {isFilterBoxOpen && (
        <FilterBox
          isOpen={true}
          onOpen={() => {}}
          onReset={resetFilter}
          onClose={toggleFilterBox}
        />
      )}
    </div>
  );
};

export default IndexPage;
