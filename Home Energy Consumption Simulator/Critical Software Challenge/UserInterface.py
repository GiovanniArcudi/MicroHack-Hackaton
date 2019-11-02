from tkinter import *
from Floor import *
from Appliances import *
from PIL import ImageTk, Image


class Interface(Tk):

    def __init__(self, floor):
        super().__init__()

        # Current floor
        self.floor = floor

        # List of floors
        self.floorsList = ["large blanked", "loft blanked", "many rooms blanked", "medium blanked", "simple blanked"]

        # Dictionary of floors and pathname
        self.floorsDict = {
            "large blanked": "./Floor Plans/large_blanked.jpg",
            "loft blanked": "./Floor Plans/loft_blanked.jpg",
            "many rooms blanked": "./Floor Plans/many_rooms_blanked.jpg",
            "medium blanked": "./Floor Plans/medium_blanked.jpg",
            "simple_blanked": "./Floor Plans/simple_blanked.jpg"
        }

        # List of appliances
        self.appliancesList = list(self.floor.appliances.keys())

        # Initialise the window
        self.title("Critical Software Challenge")
        self.initialise()
        self.grid()

    def initialise(self):

        # Floor plan frame
        flframe = Frame(self).grid(column=0)

        flplan = ImageTk.PhotoImage(self.floor.draw())  # Get the floor plan image
        self.flLabel = Label(flframe, image=flplan)  # Floor plan image
        self.flLabel.image = flplan
        self.flLabel.grid(rowspan=4)

        # Menu frame
        menu = Frame(self).grid(column=1)

        # Floor drop down menu
        self.floorSelected = StringVar(self)  # Floor selected
        # self.floorSelected.set(self.floorsList[0])  # Default floor

        Label(menu, text="Select a floor:").grid(row=0, column=1)
        self.floorMenu = OptionMenu(menu,
                                    self.floorSelected,
                                    #self.floorsList[0],
                                    *self.floorsList,
                                    command=self.floorChange)

        self.floorMenu.grid(row=0, column=2)

        # Appliances drop down menu
        applianceSelected = StringVar(self)  # Appliance selected

        Label(menu, text="Select an appliance:").grid(row=0, column=3)

        if len(self.appliancesList) == 0:
            self.applianceMenu = OptionMenu(menu, applianceSelected, "-")
        else:
            self.applianceMenu = OptionMenu(menu, applianceSelected, *self.appliancesList, command=self.switchAppliance)

        self.applianceMenu.grid(row=0, column=4)

        # Add an appliance
        Button(menu, text="Add Appliance", command=self.addAppliance).grid(row=1, column=3)


        ### Radio buttons ###
        self.status = StringVar()  # Turn on/off the appliance
        self.status.set("Off")  # Off by default

        Label(menu, text="On").grid(row=2, column=1)
        Radiobutton(menu, variable=self.status, value="On").grid(row=2, column=2)

        Label(menu, text="Off").grid(row=2, column=3)
        Radiobutton(menu, variable=self.status, value="Off").grid(row=2, column=4)

        # Information about the floor
        totalCost = 0
        totalEnergy = 0
        for appliance in self.floor.appliances:
            totalEnergy = appliance.getCost()/60
            cost = totalEnergy * (8.706 if appliance.fuelType is "gas" else 20.156)
            totalCost = totalCost + cost/100

        Label(menu, text="Total cost: £" + str(totalCost)).grid(row=3, column=1)
        Label(menu, text="Energy consumed: " + str(totalEnergy) + "kWh").grid(row=4, column=1)

    def floorChange(self, selection):

        self.destroy()

        floor = Floor(self.floorsDict[selection])
        root = Interface(floor)
        root.mainloop()

    def addAppliance(self):

        tempWindow = Tk()
        tempWindow.title("Add Appliance")
        Label(tempWindow, text="Name of the appliance:").grid()
        nameEntry = Entry(tempWindow).grid()

        tempWindow.mainloop()

        # self.floor.add(name, selection)

    def switchAppliance(self):
        pass


floor = Floor("/Users/robertoa/OneDrive - University of Southampton/MicroHack/critical_software/ECSS Hackathon Files/Floor Plans/large_blanked.jpg")
root = Interface(floor)
root.mainloop()
